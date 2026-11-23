import Script from "next/script";
import { adsConfig, adsEnabled } from "@/config/ads";

/**
 * Loads the official Google AdSense script only when a valid publisher ID is
 * configured. Loaded after the page is interactive so it never delays the
 * editor. Ad scripts receive no editor content from this site.
 *
 * Consent: enable a Google-certified CMP (AdSense → Privacy & messaging) for
 * EEA/UK/Swiss visitors. The CMP message is served by this same script.
 */
export function AdSenseScript() {
  if (!adsEnabled) return null;
  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.clientId}`}
    />
  );
}
