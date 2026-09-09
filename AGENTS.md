# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (webpack mode) at localhost:3000
pnpm build        # Static export (webpack mode) to ./out
pnpm lint         # Run ESLint
pnpm test:single-player-context  # 单人上下文回归
```

> Note: The project explicitly uses `--webpack` flag (not Turbopack) for both dev and build.

## Environment

纯前端版本不需要任何环境变量或自建服务端。AI 网关与 MiniMax 配置由
玩家在应用内「模型/语音连接」填写，仅存 localStorage（见 `.env.example`）。
`pnpm build` 产物是 `./out` 的纯静态文件，可直接交给 Capacitor/WebView/静态托管。

## Architecture Overview

Wolfcha is an AI-powered Werewolf (社交推理) game built with **Next.js 16 App Router**. Every non-human player is controlled by an LLM, with the player competing against AI characters.

### State Management

Game state is managed with **Jotai atoms** (`src/store/game-machine.ts`):
- `gameStateAtom` — the single source of truth for all game state, persisted to `localStorage` (24h TTL) for page refresh recovery
- `src/store/settings.ts` — user settings atom

### Game Logic Layer

The game logic is split across several layers:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Game Master | `src/lib/game-master.ts` | Pure functions: player setup, phase transitions, win condition checks, kill resolution |
| Flow Controller | `src/lib/game-flow-controller.ts` | `AsyncFlowController` — interrupt/pause/resume async game flows; `FlowToken` pattern prevents stale callbacks |
| Phase Manager | `src/game/core/PhaseManager.ts` | Maps each `Phase` enum value to a `GamePhase` class that generates LLM prompts |
| Game Phases (classes) | `src/game/phases/` | `NightPhase`, `DaySpeechPhase`, `VotePhase`, `BadgePhase`, `HunterPhase`, `WhiteWolfKingBoomPhase` |
| Game Logic Hook | `src/hooks/useGameLogic.ts` | React hook that orchestrates the full game loop; delegates to sub-hooks |
| Phase Sub-hooks | `src/hooks/game-phases/` | `useDayPhase`, `useBadgePhase`, `useSpecialEvents` |
| Dialogue Manager | `src/hooks/useDialogueManager.ts` | Streaming AI speech management, typewriter effect |

### Game Phases (type `Phase`)

Defined in `src/types/game.ts`. Night: `NIGHT_START → NIGHT_GUARD_ACTION → NIGHT_WOLF_ACTION → NIGHT_WITCH_ACTION → NIGHT_SEER_ACTION → NIGHT_RESOLVE`. Day: `DAY_START → DAY_BADGE_SIGNUP → DAY_BADGE_SPEECH → DAY_BADGE_ELECTION → DAY_SPEECH → DAY_VOTE → DAY_RESOLVE`. Special: `HUNTER_SHOOT`, `WHITE_WOLF_KING_BOOM`, `BADGE_TRANSFER`, `GAME_END`.

### AI Integration

- 所有 LLM 调用由浏览器直连玩家配置的 **OpenAI 兼容网关**（`/chat/completions`）。
  入口为 `src/lib/llm.ts` → `src/lib/llm-direct.ts`，未配置网关时开局入口会打开设置。
- `ModelRef` 等模型展示数据只用于头像/人设，实际请求统一使用设置的网关模型。
- Prompt construction per phase is handled by `GamePhase` subclasses via `getPrompt(context, player): PromptResult`
- `src/lib/llm.ts` — 流式/批处理/JSON 修复等公共能力
- `src/lib/character-generator.ts` — generates AI player personas (MBTI, background, style); supports Genshin mode
- `src/lib/ai-config.ts` — 温度与场景配置

### Audio

- `src/lib/audio-manager.ts` — `AudioManager` singleton; task-based sequential audio queue
- `src/lib/narrator-audio-player.ts` — narrator TTS playback
- `src/lib/narrator-voice.ts` — voice selection logic
- `src/lib/tts-direct.ts` — 可选 MiniMax 浏览器直连；未配置/失败时静默降级为字幕

### i18n

`next-intl` with messages defined in `src/i18n/messages.ts`. Locale stored via `src/i18n/locale-store.ts`. The `src/i18n/translator.ts` provides `getI18n()` for use outside React components.

### 无服务端

项目不再包含任何 API 路由、中间件或数据库。`src/lib/game-session-tracker.ts`
是纯本地会话（仅用于存档恢复），自定义角色与游戏状态均存 localStorage。

### Key Conventions

- **`FlowToken` pattern**: Before any async operation, capture `flowController.getToken()`. After `await`, call `token.isValid()` to abort if the flow was interrupted (e.g., game reset mid-speech).
- **Phase prompt generation**: Add a new phase by creating/extending a `GamePhase` subclass in `src/game/phases/`, then register it in `PhaseManager`.
- **Model routing**: 浏览器直连 OpenAI 兼容网关；Key/地址/模型在 `src/lib/api-keys.ts`。
- Uses **pnpm** as package manager.

### 单人上下文修改规范

- 发言解析只允许公开字段；不要用任意引号提取、`Object.values` 或原始响应兜底朗读。
- 修改发言协议时保留真实模型响应作为回归样本；同时检查完整性与保密性，覆盖字段顺序、会话封套和部分解析失败。HTTP 200 不能当作发言解析成功，格式错误必须进入 AI 日志。
- 事实文案必须明确主体、夜次和公开范围；“守护目标未出局”不能写成“当晚平安无事”，缺失记录也不能当作无人死亡。
- 改动协议或事实表述后，核对真实对局中的“原始响应→字幕/历史→下一角色输入”，并区分整局实测与固定响应回放。
- 段落幂等使用请求 ID + 索引，不能按文字去重。字幕、TTS、队列和历史提交必须验证同一个请求身份。
- 特殊技能决策同样需要当天公开发言。增加阶段时扩展 `context-regressions.test.ts` 的证据矩阵。
- 夜间结算与公开结果分开记录；临时切换提示词阶段不能改变信息可见性。
- 逐轮投票保存独立快照，同时维护旧存档与开发回滚兼容。
- 提交前运行 `pnpm test:single-player-context`，再做类型检查和生产构建；具体原因与边界见 `docs/单人上下文约束.md`。
