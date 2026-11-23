"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/browser";

/** Copies text and exposes a short-lived "copied" state for feedback. */
export function useCopy(resetAfterMs = 1800) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyText(text);
      setStatus(ok ? "copied" : "failed");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus("idle"), resetAfterMs);
    },
    [resetAfterMs],
  );

  return { status, copy };
}
