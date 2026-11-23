"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** A single responsive AdSense unit. Only ad configuration is passed to Google. */
export function AdUnit({ clientId, slot }: { clientId: string; slot: string }) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    const el = ref.current;
    // Guard against double initialisation (React Strict Mode, re-renders).
    if (!el || el.dataset.adsbygoogleStatus || el.dataset.requested) return;
    el.dataset.requested = "true";
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or consent choices may prevent loading; the page works regardless.
    }
  }, []);

  return (
    <ins
      ref={ref}
      className="adsbygoogle block w-full"
      style={{ display: "block" }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
