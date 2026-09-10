<p align="right"><a href="./README.md">English</a></p>

![Wolfcha 猹杀 — 一个人也能玩狼人杀](assets/readme/hero-zh.png)

<p align="center">
  <strong>你坐一席，剩下的人交给 AI。</strong><br />
  随时开一桌有推理、有伪装、也有意外的狼人杀。
</p>

<p align="center">
  <a href="https://wolf-cha.com"><strong>在线开局</strong></a>
  ·
  <a href="#本地运行">本地运行</a>
  ·
  <a href="./README.md">English</a>
</p>

## 一个人，也能凑齐一桌

Wolfcha 保留了狼人杀最难替代、也最难约齐的部分：一整桌性格不同的玩家。你选择一个身份，加入 8–12 人对局；其余玩家的人设、秘密、发言和投票全部由 AI 驱动。

| 先有人设 | 记得桌面 | 为阵营行动 |
| --- | --- | --- |
| 每个 AI 都有稳定性格，再叠加一层隐藏的游戏身份。 | 他们会记住发言、投票、死亡结果和不断变化的怀疑链。 | 他们会根据阵营目标选择怀疑、保护、反驳、跟票或隐藏信息。 |

## 一局是怎么发生的

1. **黑夜行动**：狼人选择目标，神职根据各自掌握的信息行动。
2. **白天发言**：存活玩家解释、怀疑、误导，或者推动自己的判断。
3. **全员投票**：把语言博弈变成一次真正的桌面决策。
4. **局势重写**：死亡与新信息继续改变下一轮的关系。

可选身份包括 **村民、狼人、白狼王、预言家、女巫、猎人、守卫和白痴**。所有对话实时生成，即使配置相同，也可能打出完全不同的一桌。

## 为氛围服务的细节

- 复古视觉风格，以及昼夜切换时的眨眼转场。
- 角色发言时的口型动画。
- 神职夜间行动的专属立绘。
- 可选 AI 语音与观战模式。

## 项目由来

Wolfcha 诞生于 **观猹 × 魔搭环球黑客松**。名字由 **Wolf（狼人杀）** 和 **Cha（猹）** 组成：既在桌上参与推理，也像观众一样看一群 AI 人格互相碰撞。

## 本地运行

需要安装 Node.js 和 [pnpm](https://pnpm.io/)。

```bash
git clone https://github.com/oil-oil/wolfcha.git
cd wolfcha
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)，点击「配置 LLM 网关」填写自己的
OpenAI 兼容 API 地址、Key 与模型名即可开局。游戏在浏览器内直连模型，无需登录、
积分或自建服务端。

## 打包 Android APK

移动端是 Capacitor 套壳，加载 `./out` 里的静态产物。需要 Node.js + pnpm，以及
[Android Studio](https://developer.android.com/studio)（提供 Android SDK 和自带 JDK）。

```bash
# 1. 构建静态产物到 ./out
pnpm build

# 2. 同步到 Android 工程
npx cap sync android

# 3. 构建 debug APK
cd android
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
  ANDROID_HOME="$HOME/Library/Android/sdk" \
  ./gradlew assembleDebug
```

APK 产物在 `android/app/build/outputs/apk/debug/app-debug.apk`，安装到已连接的手机：

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

注意事项：

- 上面的 `JAVA_HOME`（需要 JDK 21+）和 `ANDROID_HOME` 按本机实际安装路径调整；也可以
  `npx cap open android` 用 Android Studio 构建。
- SDK 版本写在 `android/variables.gradle`（`compileSdk` / `targetSdk`）和
  `android/app/build.gradle`（`buildToolsVersion`），按本机已安装的组件修改。
- `app-debug.apk` 使用调试证书签名，适合自己侧载安装；上架应用商店需要另行配置
  release 签名。

只想拿纯静态站点（不打包 APK）时，运行 `pnpm build` 即可，产物在 `./out`。

## 技术栈

[Next.js 16](https://nextjs.org/) · [TypeScript](https://www.typescriptlang.org/) · [Tailwind CSS 4](https://tailwindcss.com/) · [Jotai](https://jotai.org/) · [Radix UI](https://www.radix-ui.com/) · [Framer Motion](https://www.framer.com/motion/) · [Tiptap](https://tiptap.dev/)

## 无服务端

Wolfcha 是纯前端应用：LLM 调用由浏览器直连你配置的 OpenAI 兼容网关，可选的
MiniMax 语音也由浏览器直连。对局存档、自定义角色与设置均保存在本机。

## 后续计划

- 更好的移动端体验
- 结束后的复盘与自由聊天
- 更强的记忆、伪装和桌面行为
- 时间回溯、AI 洞察等特殊机制
- 和朋友一起加入 AI 圆桌
- 为表现出色的 AI 人格点赞

## License

[MIT](./LICENSE)
