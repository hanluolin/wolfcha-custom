/**
 * 本地默认头像生成脚本（零运行时依赖）
 *
 * 用途：
 *  将 DiceBear notionists 头像在本地预生成为静态 SVG 资源，
 *  应用运行时不再请求 api.dicebear.com 外网（该服务在中国大陆常无法访问，
 *  会导致玩家/AI 默认头像破图）。
 *
 * 产物：
 *  public/avatars/bg/avatar-{NN}-{idle|t1|t2}.svg      —— 带柔和底色（普通头像）
 *  public/avatars/clear/avatar-{NN}-{idle|t1|t2}.svg   —— 透明背景（大立绘/说话头像）
 *
 * 嘴型变体与 src/lib/avatar-config.ts 保持一致：
 *   idle = variant03（默认静止微笑）、t1 = variant04、t2 = variant11（说话切换）
 *
 * 重新生成（一次性开发工具，需要临时安装 dicebear v7，不会污染项目依赖）：
 *   mkdir -p /tmp/dicebear-gen && cd /tmp/dicebear-gen
 *   npm init -y && npm install @dicebear/core@7.0.0 @dicebear/notionists@7.0.0
 *   cp <project>/scripts/generate-avatars.mjs .
 *   node generate-avatars.mjs
 */
import { createAvatar } from "@dicebear/core";
import * as notionists from "@dicebear/notionists";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// ===== 配置 =====
const COUNT = 16; // 默认头像数量
const SEED_PREFIX = "wolfcha-avatar";
// 与 src/lib/avatar-config.ts AVATAR_BG_COLORS 同源的低饱和底色
const BG_COLORS = [
  "e8d5c4", "d4e5d7", "d5dce8", "e8d4d9", "ddd4e8",
  "d4e8e5", "e8e4d4", "d4d8e8", "e5d4d4", "dae8d4",
  "f3d9d2", "d2e3f0", "e6f0d2", "f0e3d2", "e3d2f0", "d2f0e6",
];
// 嘴型映射：idle / 说话1 / 说话2（顺序与 TALKING_LIPS 一致）
const MOUTH_VARIANTS = {
  idle: "variant03",
  t1: "variant04",
  t2: "variant11",
};
// 可用眼睛（与 avatar-config 排除 variant03 后的 DAY_EYES 一致）
const EYE_VARIANTS = ["variant01", "variant02", "variant04", "variant05"];

// 输出根目录：默认 <项目>/public/avatars，可用 OUT_DIR 覆盖（临时目录运行时使用）
const OUT_ROOT =
  process.env.OUT_DIR ??
  join(dirname(fileURLToPath(import.meta.url)), "..", "public", "avatars");

const pad = (n) => String(n).padStart(2, "0");

function main() {
  mkdirSync(join(OUT_ROOT, "bg"), { recursive: true });
  mkdirSync(join(OUT_ROOT, "clear"), { recursive: true });

  let count = 0;
  for (let i = 0; i < COUNT; i++) {
    const idx = pad(i);
    const seed = `${SEED_PREFIX}-${idx}`;
    const eye = EYE_VARIANTS[i % EYE_VARIANTS.length];

    for (const [mouthKey, mouthVariant] of Object.entries(MOUTH_VARIANTS)) {
      const styleProps = {
        seed,
        lips: [mouthVariant],
        eyes: [eye],
        beardProbability: 0,
        earringsProbability: 0,
        glassesProbability: 0,
        gestureProbability: 0,
      };
      // 带底色版本
      const bg = BG_COLORS[i % BG_COLORS.length];
      const bgSvg = createAvatar(notionists, {
        ...styleProps,
        backgroundColor: [bg],
      }).toString();
      const bgPath = join(OUT_ROOT, "bg", `avatar-${idx}-${mouthKey}.svg`);
      writeFileSync(bgPath, bgSvg);
      count += 1;

      // 透明背景版本（大立绘叠加用）
      const clearSvg = createAvatar(notionists, {
        ...styleProps,
        backgroundColor: ["transparent"],
      }).toString();
      const clearPath = join(OUT_ROOT, "clear", `avatar-${idx}-${mouthKey}.svg`);
      writeFileSync(clearPath, clearSvg);
      count += 1;
    }
  }
  console.log(`OK: generated ${count} avatars -> ${OUT_ROOT}`);
}

main();
