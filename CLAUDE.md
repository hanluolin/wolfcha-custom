# CLAUDE.md

Wolfcha 工程指引（与 `AGENTS.md` 同步，纯前端版）。

## Commands

```bash
pnpm dev          # 本地开发（webpack 模式）
pnpm build        # 静态导出到 ./out
pnpm lint         # ESLint
pnpm test:single-player-context  # 单人上下文回归
```

## Environment

纯前端版本无需任何自建服务端或环境变量。玩家在应用内「模型/语音连接」
填写 OpenAI 兼容网关（地址/Key/模型）与可选的 MiniMax Key；所有配置
只保存在本机 localStorage。`./out` 可直接交给 Capacitor / WebView / 静态托管。

## Architecture Overview

Wolfcha 是基于 **Next.js 16 App Router（纯前端静态导出）** 的 AI 狼人杀：
每名非真人玩家由 LLM 控制。

- 游戏状态：`src/store/game-machine.ts`（localStorage 断点恢复）
- 纯逻辑：`src/lib/game-master.ts`、`src/game/core/PhaseManager.ts`、`src/game/phases/`
- 协调层：`src/hooks/useGameLogic.ts` 及 `src/hooks/game-phases/`
- AI：`src/lib/llm.ts` → `src/lib/llm-direct.ts` 浏览器直连 OpenAI 兼容网关
- 语音：`src/lib/tts-direct.ts` 可选 MiniMax 直连；旁白为本地 `public/audio/narrator`
- 自定义角色：localStorage（`src/hooks/useCustomCharacters.ts`）
- 会话：`src/lib/game-session-tracker.ts` 纯本地，仅作存档身份

没有 `src/app/api/`、没有 Supabase、没有登录/积分/支付。

单人上下文修改规范及提交前检查，见 `AGENTS.md` 与 `docs/单人上下文约束.md`。
