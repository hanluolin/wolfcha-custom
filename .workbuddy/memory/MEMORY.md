# Wolfcha 项目长期笔记

## 许可证 / 合规（重要）

- **上游 `oil-oil/wolfcha` 的许可证是 Apache-2.0，不是 MIT。** 证据：GitHub API `/repos/oil-oil/wolfcha` 返回 `spdx_id: apache-2.0`；仓库根 `LICENSE` 是 Apache-2.0 全文（202 行 / 11358 字节）；上游无 `NOTICE` 文件。
- 上游三个 README 里写的 "MIT" 属于**上游文档错误**；2026-09-10 已在本仓库更正为 Apache-2.0，并加入「二次开发说明 / Derivative work」段落（README.md、README.zh.md、README.en.md）。
- 二次开发分发义务（Apache-2.0 §4）：保留 LICENSE 与版权/归属声明；声明修改过文件；上游有 NOTICE 才必须附带（此处没有）。可为自己新增的修改加版权声明，但不能把整体改成 MIT 或删除原版权声明。
- `package.json` 目前**没有** `license` 字段；可补 `"license": "Apache-2.0"`。

## 仓库 / 远端

- 本地 `origin` 仍指向 `https://github.com/oil-oil/wolfcha.git`（上游），尚无用户自己的远端。推到自己的仓库前建议：`git remote rename origin upstream` 再 `git remote add origin <自己的仓库>`。
- README.md 的 "Local development" 段落里 `git clone https://github.com/oil-oil/wolfcha.git` 仍指向上游，换成自己的仓库地址更合适。

## 技术约定（本项目特定）

- 输入框（TipTap `MentionInput`）：可编辑区 `.wc-input-field` 的 `max-height` 必须配套 `overflow-y-auto`，否则长文本会画到 `.wc-input-box` 外面；外层 `.wc-input-box` 用 `min-height` 才能跟着内容长高。
- 移动端横向滚动条 `.wc-mobile-player-bar__track` 内**不要**用 `backdrop-filter`、无限 `box-shadow/border` 动画、触摸设备上的 `:hover` 位移——这些在 Android WebView 滚动时会闪烁。
- Tailwind v4（`@import "tailwindcss"`）：globals.css 里**未分层**的普通 CSS 优先级高于 Tailwind 工具类，因此用普通类覆盖工具类是安全且与顺序无关的。
