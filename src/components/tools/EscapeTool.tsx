"use client";

import { ArrowLeftRight, CheckCircle2, XCircle } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Segmented } from "@/components/ui/Segmented";
import { sampleEscapeText, sampleUnescapeText } from "@/content/samples";
import { escapeJsonString, unescapeJsonString } from "@/lib/json/escape";
import { InputPanel } from "./InputPanel";
import { EmptyState, ErrorState, OutputPanel } from "./OutputPanel";

type Mode = "escape" | "unescape";

export function EscapeTool() {
  const [mode, setMode] = useState<Mode>("escape");
  const [input, setInput] = useState("");
  const [wrapQuotes, setWrapQuotes] = useState(false);
  const deferredInput = useDeferredValue(input);

  const result = useMemo(() => {
    if (deferredInput === "") return null;
    if (mode === "escape") return { ok: true as const, value: escapeJsonString(deferredInput, wrapQuotes) };
    return unescapeJsonString(deferredInput);
  }, [deferredInput, mode, wrapQuotes]);

  const swap = () => {
    if (result?.ok) setInput(result.value);
    setMode(mode === "escape" ? "unescape" : "escape");
  };

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="Escape options"
        className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-card"
      >
        <Segmented
          label="Mode"
          value={mode}
          options={[
            { value: "escape", label: "Escape" },
            { value: "unescape", label: "Unescape" },
          ]}
          onChange={setMode}
        />
        {mode === "escape" && (
          <Checkbox label="Wrap in double quotes" checked={wrapQuotes} onChange={setWrapQuotes} description="Output a complete JSON string literal" />
        )}
        <Button size="sm" icon={<ArrowLeftRight size={15} aria-hidden />} onClick={swap} disabled={!result?.ok} className="ml-auto">
          Use output as input
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <InputPanel
          title={mode === "escape" ? "Text to escape" : "Escaped string"}
          value={input}
          onChange={setInput}
          sample={mode === "escape" ? sampleEscapeText : sampleUnescapeText}
          language="text"
          lineWrapping
          placeholder={mode === "escape" ? "Paste text or JSON to escape…" : 'Paste an escaped string, e.g. {\\"name\\":\\"Ada\\"}'}
        />
        <OutputPanel
          title={mode === "escape" ? "Escaped output" : "Unescaped output"}
          value={result?.ok ? result.value : ""}
          filename={mode === "escape" ? "escaped.txt" : "unescaped.txt"}
          mimeType="text/plain"
          language="text"
          lineWrapping
          overlay={
            !result ? (
              <EmptyState>
                {mode === "escape"
                  ? "Enter text on the left. Quotes, backslashes and line breaks will be escaped for use in a JSON string."
                  : "Enter an escaped JSON string on the left to turn \\n, \\\" and \\uXXXX sequences back into text."}
              </EmptyState>
            ) : !result.ok ? (
              <ErrorState title="Cannot unescape" message={result.error} />
            ) : undefined
          }
        />
      </div>

      <div className="flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-[13px] shadow-card" role="status" aria-live="polite">
        {!result ? (
          <span className="text-muted">Waiting for input</span>
        ) : result.ok ? (
          <span className="inline-flex items-center gap-1.5 text-success">
            <CheckCircle2 size={15} aria-hidden />
            <span className="font-semibold">{mode === "escape" ? "Escaped" : "Unescaped"}</span>
            <span className="text-muted">
              {input.length.toLocaleString()} → {result.value.length.toLocaleString()} characters
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-danger">
            <XCircle size={15} aria-hidden />
            <span className="font-semibold">Invalid escaped string</span>
          </span>
        )}
      </div>
    </div>
  );
}
