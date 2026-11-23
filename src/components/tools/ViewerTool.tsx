"use client";

import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { CodeEditorHandle } from "@/components/editor/CodeEditor";
import { Button } from "@/components/ui/Button";
import { sampleJson } from "@/content/samples";
import { useParsedJson } from "@/hooks/useParsedJson";
import { stringifyNode } from "@/lib/json/format";
import { computeStats, utf8ByteLength } from "@/lib/json/process";
import { InputPanel } from "./InputPanel";
import { EmptyState, ErrorState, OutputPanel } from "./OutputPanel";
import { StatusBar } from "./StatusBar";
import { StatsGrid, WarningList } from "./ValidationReport";

export function ViewerTool() {
  const [input, setInput] = useState("");
  const parsed = useParsedJson(input);
  const viewer = useRef<CodeEditorHandle>(null);
  const inputEditor = useRef<CodeEditorHandle>(null);

  const view = useMemo(() => {
    if (!parsed?.ok) return null;
    return {
      text: stringifyNode(parsed.node, { indent: "2" }),
      stats: computeStats(parsed.node, utf8ByteLength(input)),
    };
    // `input` only feeds the byte count; recompute when the parse result changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed]);

  const goTo = (pos: number) => inputEditor.current?.goTo(pos);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <InputPanel
          title="JSON input"
          value={input}
          onChange={setInput}
          sample={sampleJson}
          errorPosition={parsed && !parsed.ok ? parsed.error.position : null}
          editorRef={inputEditor}
        />
        <OutputPanel
          title="Viewer"
          value={view?.text ?? ""}
          filename="formatted.json"
          mimeType="application/json"
          editorRef={viewer}
          placeholder="Your formatted JSON will appear here"
          overlay={
            parsed && !parsed.ok ? (
              <ErrorState title="Invalid JSON" message={`${parsed.error.message} (line ${parsed.error.line}, column ${parsed.error.column}).`} />
            ) : !parsed ? (
              <EmptyState>Paste JSON on the left to explore it here with folding and syntax highlighting.</EmptyState>
            ) : undefined
          }
          extraActions={
            <>
              <Button size="sm" variant="ghost" icon={<ChevronsDownUp size={15} aria-hidden />} onClick={() => viewer.current?.foldAll()} disabled={!view}>
                Collapse all
              </Button>
              <Button size="sm" variant="ghost" icon={<ChevronsUpDown size={15} aria-hidden />} onClick={() => viewer.current?.unfoldAll()} disabled={!view}>
                Expand all
              </Button>
            </>
          }
        />
      </div>

      <StatusBar
        state={!parsed ? { kind: "empty" } : parsed.ok ? { kind: "valid", stats: view?.stats, warnings: parsed.warnings.length } : { kind: "invalid", error: parsed.error }}
        onGoTo={goTo}
      />

      {view && parsed?.ok && (
        <section aria-labelledby="structure-heading" className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-card">
          <h2 id="structure-heading" className="text-[13px] font-semibold tracking-wide uppercase">
            Structure summary
          </h2>
          <WarningList warnings={parsed.warnings} onGoTo={goTo} />
          <StatsGrid stats={view.stats} />
        </section>
      )}
    </div>
  );
}
