> **Derivative work · Thanks to the original authors**
>
> This project is a **derivative work built on [`oil-oil/wolfcha`](https://github.com/oil-oil/wolfcha)**.
> All credit for the original concept, design, and implementation goes to the upstream authors and contributors —
> thank you for building and open-sourcing it.
> Upstream repository: <https://github.com/oil-oil/wolfcha>

> **What changed in this fork**
>
> - **Backend and config files removed** — no `.env`, no Supabase, no server-side API, no self-hosted service, and no environment variables at all. `pnpm build` emits a pure static site you can drop into Capacitor, a WebView, or any static host.
> - **Everything is configured in the UI** — open the app, click **Configure LLM gateway**, and enter your own OpenAI-compatible API URL, key, and model name. No code edits, no rebuild, no `.env`.
> - **Your key never leaves your browser** — settings are stored in your own `localStorage`, and requests go **straight from your browser** to the gateway you configured. Nothing passes through the deployer's server, so there is no key collection or leak risk.
> - **Deep-thinking mode supported** — toggle reasoning on or off and pick a thinking depth (minimal / low / medium / high) for models that accept `reasoning_effort`.

<p align="right"><a href="./README.zh.md">简体中文</a></p>

![Wolfcha — Play Werewolf solo](assets/readme/hero-en.png)

<p align="center">
  <strong>You take one seat. AI players fill the rest.</strong><br />
  An AI-native Werewolf game for deduction, bluffing, and chaos on demand.
</p>

<p align="center">
  <a href="https://wolf-cha.com"><strong>Play online</strong></a>
  ·
  <a href="#local-development">Run locally</a>
  ·
  <a href="./README.zh.md">中文说明</a>
</p>

## One human. A table that talks back.

Wolfcha recreates the part of Werewolf that is hardest to schedule: a complete table of distinct players. Choose your role, enter an 8–12 seat game, and let the AI handle every other personality, secret, accusation, and vote.

| Characters first | Table-aware memory | Decisions with intent |
| --- | --- | --- |
| Each AI has a stable personality layered over a hidden game role. | Players follow speeches, votes, deaths, and changing suspicions. | They accuse, defend, bluff, follow, or hold back according to their faction goal. |

## What happens at the table

1. **Night falls** — Werewolves choose a target while special roles act on private information.
2. **The table speaks** — Every surviving player explains, suspects, misdirects, or pushes a read.
3. **Everyone votes** — The group turns conversation into a decision.
4. **The story changes** — New deaths and revealed information reshape the next round.

You can play as **Villager, Werewolf, White Wolf King, Seer, Witch, Hunter, Guard, or Idiot**. Conversations are generated in real time, so the same setup can produce a very different table.

## Built for atmosphere

- Retro visual direction with day/night eye-blink transitions.
- Lip-sync animation while characters speak.
- Dedicated role artwork for night actions.
- Optional AI voice playback and spectator mode.

## Project origin

Wolfcha was created at the **Watcha × ModelScope Global Hackathon**. The name combines **Wolf** with **Cha (猹)** — part Werewolf, part spectator watching a table of AI personalities collide.

## Local development

Requirements: Node.js and [pnpm](https://pnpm.io/).

```bash
git clone https://github.com/oil-oil/wolfcha.git
cd wolfcha
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Click **Configure LLM gateway** and enter your own OpenAI-compatible API URL, key, and model. Everything runs in the browser — no accounts, credits, or backend server.

## Building an Android APK

The mobile app is a [Capacitor](https://capacitorjs.com/) shell that loads the static
export from `./out`. You need Node.js + pnpm and [Android Studio](https://developer.android.com/studio)
(it provides both the Android SDK and a bundled JDK).

```bash
# 1. Build the static web bundle into ./out
pnpm build

# 2. Copy it into the Android project
npx cap sync android

# 3. Build the debug APK
cd android
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
  ANDROID_HOME="$HOME/Library/Android/sdk" \
  ./gradlew assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. Install it
on a connected device with:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Notes:

- Adjust `JAVA_HOME` (JDK 21+) and `ANDROID_HOME` if your paths differ; you can also
  run `npx cap open android` and build from Android Studio.
- SDK versions live in `android/variables.gradle` (`compileSdk` / `targetSdk`) and
  `android/app/build.gradle` (`buildToolsVersion`) — change them to match the
  components you have installed.
- `app-debug.apk` is signed with the debug key, which is fine for sideloading;
  store releases need a release keystore.

For a plain static export without the Android shell, `pnpm build` alone emits `./out`.

## Tech stack

[Next.js 16](https://nextjs.org/) · [TypeScript](https://www.typescriptlang.org/) · [Tailwind CSS 4](https://tailwindcss.com/) · [Jotai](https://jotai.org/) · [Radix UI](https://www.radix-ui.com/) · [Framer Motion](https://www.framer.com/motion/) · [Tiptap](https://tiptap.dev/)

## No backend

Wolfcha is a pure front-end app. LLM calls go straight from your browser to the
OpenAI-compatible gateway you configure; optional MiniMax TTS calls are also
made directly from the browser. Game progress, custom characters, and settings
are stored locally on the device.

## Roadmap

- Better mobile play
- Post-game review and free chat
- Richer memory, bluffing, and table behavior
- Special mechanics such as time rewind and AI insight
- Multiplayer with friends and AI players
- Community ratings for standout AI personalities

## Derivative work

This project is a **derivative work** built on top of [oil-oil/wolfcha](https://github.com/oil-oil/wolfcha).

- Upstream repository: <https://github.com/oil-oil/wolfcha>
- Copyright of the original work belongs to the upstream authors.
- Changes made in this repository (for example the pure front-end rewrite and the mobile play fixes) are distributed under the same license as the upstream project.

## License

[Apache License 2.0](./LICENSE)

The upstream project [oil-oil/wolfcha](https://github.com/oil-oil/wolfcha) is licensed under the Apache License 2.0, and this repository — a derivative work based on it — is distributed under the same license. The original copyright notices and license text are retained.
