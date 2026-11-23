/**
 * Central site configuration. Every value has a safe default so the site
 * builds and runs without any environment variables.
 */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  // Provided automatically by Vercel at build time.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "PrivateJSON",
  shortDescription: "Secure, private, browser-based JSON formatter and developer toolkit",
  url: resolveSiteUrl(),
  locale: "en_US",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "",
  privacyStatement:
    "Your JSON never leaves your device. All formatting and validation happen locally in your browser. We do not upload, store, or transmit your JSON data.",
  /** Last meaningful update of the legal pages, shown on those pages. */
  legalUpdated: "2026-11-23",
} as const;

export function absoluteUrl(path: string): string {
  if (path === "/") return siteConfig.url;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
