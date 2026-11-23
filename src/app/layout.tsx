import type { Metadata, Viewport } from "next";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { themeInitScript } from "@/components/layout/ThemeToggle";
import { adsConfig, adsEnabled } from "@/config/ads";
import { siteConfig } from "@/config/site";
import "./globals.css";

const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `JSON Formatter & Validator | ${siteConfig.name}`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.shortDescription,
  applicationName: siteConfig.name,
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false },
  verification: verification ? { google: verification } : undefined,
  other: adsEnabled ? { "google-adsense-account": adsConfig.clientId } : undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f17" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-accent px-4 py-2 font-medium text-accent-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <AdSenseScript />
      </body>
    </html>
  );
}
