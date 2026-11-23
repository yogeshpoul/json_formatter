"use client";

import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";
import type { EditorApi, EditorLanguage } from "./codemirror";

export interface CodeEditorHandle {
  focus(): void;
  goTo(position: number): void;
  foldAll(): void;
  unfoldAll(): void;
}

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  language?: EditorLanguage;
  ariaLabel: string;
  placeholder?: string;
  /** Character offset to highlight as a syntax error. */
  errorPosition?: number | null;
  lineWrapping?: boolean;
  className?: string;
  ref?: Ref<CodeEditorHandle>;
}

/**
 * Code editor backed by CodeMirror 6, loaded lazily after the page becomes
 * interactive. Until it loads, a plain textarea with identical dimensions is
 * shown, so there is no layout shift and the user can start typing at once.
 */
export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  language = "json",
  ariaLabel,
  placeholder,
  errorPosition = null,
  lineWrapping = false,
  className = "",
  ref,
}: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const apiRef = useRef<EditorApi | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    let cancelled = false;
    let api: EditorApi | null = null;
    import("./codemirror").then(({ createEditor }) => {
      if (cancelled || !hostRef.current) return;
      const hadFocus = document.activeElement === fallbackRef.current;
      api = createEditor(hostRef.current, {
        doc: valueRef.current,
        readOnly,
        language,
        ariaLabel,
        placeholder,
        lineWrapping,
        onChange: readOnly ? undefined : (v) => onChangeRef.current?.(v),
      });
      apiRef.current = api;
      setReady(true);
      if (hadFocus) api.focus();
    });
    return () => {
      cancelled = true;
      api?.destroy();
      apiRef.current = null;
    };
  }, [readOnly, language, ariaLabel, placeholder, lineWrapping]);

  useEffect(() => {
    if (ready) apiRef.current?.setDoc(value);
  }, [value, ready]);

  useEffect(() => {
    if (ready) apiRef.current?.setError(errorPosition);
  }, [errorPosition, ready]);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => (apiRef.current ? apiRef.current.focus() : fallbackRef.current?.focus()),
      goTo: (pos) => {
        if (apiRef.current) apiRef.current.goTo(pos);
        else if (fallbackRef.current) {
          fallbackRef.current.focus();
          fallbackRef.current.setSelectionRange(pos, pos);
        }
      },
      foldAll: () => apiRef.current?.foldAll(),
      unfoldAll: () => apiRef.current?.unfoldAll(),
    }),
    [],
  );

  return (
    <div className={`cm-host relative min-h-0 overflow-hidden ${className}`}>
      <div ref={hostRef} className={`absolute inset-0 ${ready ? "" : "invisible"}`} />
      {!ready && (
        <textarea
          ref={fallbackRef}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          aria-label={ariaLabel}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap={lineWrapping ? "soft" : "off"}
          className="absolute inset-0 h-full w-full resize-none border-0 bg-surface py-2 pl-[52px] pr-3 font-mono text-[13px] leading-[1.6] text-fg outline-none placeholder:text-subtle"
        />
      )}
    </div>
  );
}
