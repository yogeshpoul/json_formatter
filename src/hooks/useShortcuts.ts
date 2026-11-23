"use client";

import { useEffect, useRef } from "react";

export interface Shortcut {
  /** Lower-case key, e.g. "enter", "s", "o". */
  key: string;
  shift?: boolean;
  handler: () => void;
}

/**
 * Registers Ctrl/⌘ keyboard shortcuts while the component is mounted.
 * Listens in the capture phase so shortcuts also work inside the editor.
 */
export function useShortcuts(shortcuts: Shortcut[]) {
  const ref = useRef(shortcuts);
  useEffect(() => {
    ref.current = shortcuts;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      const match = ref.current.find((s) => s.key === key && !!s.shift === event.shiftKey);
      if (!match) return;
      event.preventDefault();
      event.stopPropagation();
      match.handler();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);
}
