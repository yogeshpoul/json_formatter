import { adsConfig, slotFor, type AdPlacement } from "@/config/ads";
import { AdUnit } from "./AdUnit";

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

/**
 * Responsive ad placement. Renders nothing when AdSense is not configured,
 * so no empty boxes or fake ads appear. When configured, space is reserved
 * up front (min-height) to prevent layout shift, and the unit is clearly
 * labelled and separated from interactive controls to avoid accidental clicks.
 */
export function AdSlot({ placement, className = "" }: AdSlotProps) {
  const slot = slotFor(placement);
  if (!slot) return null;
  return (
    <aside aria-label="Advertisement" className={`mx-auto w-full max-w-5xl px-4 sm:px-6 ${className}`}>
      <p className="mb-1 text-center text-[11px] tracking-wider text-subtle uppercase">Advertisement</p>
      <div className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-lg md:min-h-[120px]">
        <AdUnit clientId={adsConfig.clientId} slot={slot} />
      </div>
    </aside>
  );
}
