/**
 * 浏览器直连 OpenAI 兼容网关(纯前端/静态部署/APK 用)。
 *
 * 当用户在设置中开启「浏览器直连」且已配置 OpenAI 兼容网关时,
 * 所有 AI 调用不再经过本服务的 /api/chat 代理,而是由浏览器直接
 * 请求用户的网关。前提:网关允许跨域(CORS)且 API Key 存放在浏览器。
 */
import {
  getOpenAIBaseUrl,
  getOpenAIApiKey,
  getOpenAIModel,
  getOpenAIReasoningEffort,
  getOpenAIReasoningStyle,
  getOpenAIThinkingEnabled,
  type ReasoningStyle,
} from "@/lib/api-keys";
import type {
  BatchCompletionResult,
  ChatCompletionResponse,
  GenerateOptions,
} from "./llm";
import { gameStatsTracker } from "@/hooks/useGameStats";
import { stripReasoningArtifacts } from "./llm";

function openAIEndpoint(): string {
  const base = (getOpenAIBaseUrl() || "").trim().replace(/\/+$/, "");
  if (/\/chat\/completions$/i.test(base)) return base;
  return `${base}/chat/completions`;
}

function prefersThinkingParam(style: ReasoningStyle): boolean {
  // 默认按 thinking 协议发送；确需 OpenAI 标准 reasoning_effort 的用户
  // 在设置里显式选择「reasoning_effort」。
  if (style === "thinking" || style === "auto") return true;
  if (style === "reasoning_effort") return false;
  return false;
}

function buildRequestBody(options: GenerateOptions): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: getOpenAIModel() || options.model,
    messages: options.messages,
    temperature:
      typeof options.temperature === "number" && Number.isFinite(options.temperature)
        ? options.temperature
        : 0.7,
  };
  if (typeof options.max_tokens === "number" && Number.isFinite(options.max_tokens)) {
    body.max_tokens = Math.max(16, Math.floor(options.max_tokens));
  }

  const reasoning = options.reasoning;
  const enabled =
    reasoning?.enabled === false
      ? false
      : reasoning?.enabled === true
        ? true
        : getOpenAIThinkingEnabled();
  const rawEffort =
    reasoning?.effort ?? getOpenAIReasoningEffort();
  const effort =
    rawEffort === "minimal" ||
    rawEffort === "low" ||
    rawEffort === "medium" ||
    rawEffort === "high" ||
    rawEffort === "max"
      ? rawEffort
      : undefined;
  const useThinking = enabled !== false && prefersThinkingParam(getOpenAIReasoningStyle());
  const disableThinking = enabled === false && prefersThinkingParam(getOpenAIReasoningStyle());

  if (useThinking) {
    body.thinking = { type: "enabled" };
  } else if (disableThinking) {
    body.thinking = { type: "disabled" };
  } else if (enabled && effort) {
    body.reasoning_effort = effort;
  }

  // options.response_format 已由 applyOpenAICompatOverride 预分级
  // (json_schema → json_object;关闭 json_object 时置 undefined)。
  if (options.response_format) {
    body.response_format = options.response_format;
  }
  return body;
}

function parseErrorBody(text: string): string {
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === "object") {
      const err = (parsed as { error?: unknown }).error;
      if (typeof err === "string" && err) return err;
      if (err && typeof err === "object") {
        const message = (err as { message?: unknown }).message;
        if (typeof message === "string" && message) return message;
      }
    }
  } catch {
    // ignore
  }
  const trimmed = (text || "").trim();
  return trimmed ? trimmed.slice(0, 600) : "unknown error";
}

async function doFetch(body: Record<string, unknown>, signal?: AbortSignal): Promise<Response> {
  const apiKey = getOpenAIApiKey();
  return fetch(openAIEndpoint(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });
}

export async function generateCompletionDirect(
  options: GenerateOptions,
): Promise<{ content: string; reasoning_details?: unknown; raw: ChatCompletionResponse }> {
  options.signal?.throwIfAborted();
  const body = buildRequestBody(options);
  const response = await doFetch(body, options.signal);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OpenAI-compatible API error: ${response.status} - ${parseErrorBody(text)}`);
  }
  options.signal?.throwIfAborted();
  const result = (await response.json()) as ChatCompletionResponse;
  const message = result.choices?.[0]?.message;
  if (!message) {
    throw new Error(
      `No response from model. Raw response: ${JSON.stringify(result).slice(0, 500)}`,
    );
  }
  gameStatsTracker.addAiCall({
    inputChars: options.messages.reduce((sum, m) => sum + (typeof m.content === "string" ? m.content.length : 0), 0),
    outputChars: typeof message.content === "string" ? message.content.length : 0,
    promptTokens: result.usage?.prompt_tokens,
    completionTokens: result.usage?.completion_tokens,
  });
  return {
    content: stripReasoningArtifacts(typeof message.content === "string" ? message.content : ""),
    reasoning_details: message.reasoning_details,
    raw: result,
  };
}

export async function* generateCompletionStreamDirect(
  options: GenerateOptions,
): AsyncGenerator<string, void, unknown> {
  const body = { ...buildRequestBody(options), stream: true };
  const response = await doFetch(body, options.signal);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OpenAI-compatible API error: ${response.status} - ${parseErrorBody(text)}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");
  const decoder = new TextDecoder();
  let buffer = "";
  let totalOutputChars = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trimStart();
        if (data === "[DONE]") return;
        let json: unknown;
        try {
          json = JSON.parse(data);
        } catch {
          continue;
        }
        if (!json || typeof json !== "object") continue;
        const choices = (json as { choices?: unknown[] }).choices ?? [];
        const delta = choices[0] && typeof choices[0] === "object"
          ? (choices[0] as { delta?: { content?: unknown } }).delta
          : undefined;
        const content = typeof delta?.content === "string" ? delta.content : "";
        if (content) {
          totalOutputChars += content.length;
          yield content;
        }
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  gameStatsTracker.addAiCall({
    inputChars: options.messages.reduce((sum, m) => sum + (typeof m.content === "string" ? m.content.length : 0), 0),
    outputChars: totalOutputChars,
  });
}

export async function generateCompletionBatchDirect(
  requests: GenerateOptions[],
): Promise<BatchCompletionResult[]> {
  const results = await Promise.allSettled(requests.map((r) => generateCompletionDirect(r)));
  return results.map((result) => {
    if (result.status === "fulfilled") {
      return { ok: true, content: result.value.content, reasoning_details: result.value.reasoning_details, raw: result.value.raw };
    }
    return {
      ok: false,
      error: result.reason instanceof Error ? result.reason.message : String(result.reason),
    };
  });
}
