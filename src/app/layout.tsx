import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { I18nProvider } from "@/i18n/I18nProvider";
import { defaultLocale, localeToHtmlLang } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { JsonLd, getGameJsonLd, getWebsiteJsonLd, getOrganizationJsonLd } from "@/components/seo/JsonLd";

const defaultMessages = getMessages(defaultLocale);

export const metadata: Metadata = {
  title: {
    default: defaultMessages.app.title,
    template: `%s | ${defaultMessages.app.title}`,
  },
  description: defaultMessages.app.description,
  applicationName: defaultMessages.app.title,
  keywords: [
    "AI werewolf",
    "ai werewolf game",
    "play werewolf with AI",
    "werewolf game online",
    "play werewolf online",
    "play werewolf alone",
    "single player werewolf",
    "solo werewolf",
    "AI mafia game",
    "werewolf with AI",
    "AI opponents",
    "AI social deduction",
    "werewolf game AI opponents",
    "solo werewolf game",
    "browser werewolf game",
    "free werewolf game online",
    "狼人杀",
    "在线狼人杀",
    "单人狼人杀",
    "AI 狼人杀",
    "AI狼人杀",
    "一个人玩狼人杀",
    "全 AI 对手",
    "社交推理游戏",
    "沉浸式狼人杀",
    "推理游戏",
    "语音旁白",
  ],
  openGraph: {
    title: defaultMessages.app.title,
    description: defaultMessages.app.description,
    type: "website",
    siteName: defaultMessages.app.title,
    locale: localeToHtmlLang[defaultLocale],
    url: "https://wolf-cha.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wolfcha - AI Werewolf Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultMessages.app.title,
    description: defaultMessages.app.description,
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/brand/wolfcha-favicon.svg",
  },
  metadataBase: new URL("https://wolf-cha.com"),
  alternates: {
    canonical: "/",
    languages: {
      "en": "/en",
      "zh-CN": "/zh",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={localeToHtmlLang[defaultLocale]} suppressHydrationWarning>
      <head>
      </head>
      <body className="antialiased">
        <JsonLd data={getWebsiteJsonLd()} />
        <JsonLd data={getGameJsonLd()} />
        <JsonLd data={getOrganizationJsonLd()} />
        <I18nProvider>
          <Toaster position="top-center" closeButton />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
