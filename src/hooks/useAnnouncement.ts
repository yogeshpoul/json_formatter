"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Produces a screen reader announcement only when the validity of the input
 * changes, or when `force` changes (e.g. the user clicked Validate). This
 * avoids announcing on every keystroke.
 */
export function useValidityAnnouncement(validity: "empty" | "valid" | "invalid" | null, message: string, force: number) {
  const [announcement, setAnnouncement] = useState("");
  const last = useRef<{ validity: typeof validity; force: number }>({ validity: null, force: 0 });

  useEffect(() => {
    if (validity === null || validity === "empty") return;
    if (validity === last.current.validity && force === last.current.force) return;
    last.current = { validity, force };
    setAnnouncement(message);
  }, [validity, message, force]);

  return announcement;
}
