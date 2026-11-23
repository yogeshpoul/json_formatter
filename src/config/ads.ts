/**
 * Google AdSense configuration. Ads are rendered only when a valid publisher
 * ID is provided. Nothing is loaded otherwise, and the site stays fully
 * functional.
 */

const CLIENT_ID_PATTERN = /^ca-pub-\d{16}$/;
const SLOT_PATTERN = /^\d{6,}$/;

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

const clientId = clean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID);

export const adsConfig = {
  clientId: CLIENT_ID_PATTERN.test(clientId) ? clientId : "",
  slots: {
    hero: clean(process.env.NEXT_PUBLIC_ADSENSE_SLOT_HERO),
    content: clean(process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT),
    inContent: clean(process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT),
    footer: clean(process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER),
  },
} as const;

export type AdPlacement = keyof typeof adsConfig.slots;

export const adsEnabled = adsConfig.clientId !== "";

export function slotFor(placement: AdPlacement): string | null {
  const slot = adsConfig.slots[placement];
  return adsEnabled && SLOT_PATTERN.test(slot) ? slot : null;
}
