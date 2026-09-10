import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wolfcha.app",
  appName: "Wolfcha",
  webDir: "out",
  server: {
    androidScheme: "https",
    // 允许玩家配置 http 网关（如局域网自建 LLM 网关）
    cleartext: true,
  },
};

export default config;
