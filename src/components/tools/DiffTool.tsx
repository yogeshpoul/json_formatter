"use client";

import { ArrowLeftRight, CheckCircle2, Copy, FlaskConical, Minus, PenLine, Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { CodeEditorHandle } from "@/components/editor/CodeEditor";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { sampleDiffLeft, sampleDiffRight } from "@/content/samples";
import { useCopy } from "@/hooks/useCopy";
import { useParsedJson } from "@/hooks/useParsedJson";
import { diffJson, type DiffEntry, type DiffKind } from "@/lib/json/diff";
import type { ParseResult } from "@/lib/json/types";
import { InputPanel } from "./InputPanel";

type Filter = "all" | DiffKind;

const KIND_STYLE: Record<DiffKind, { label: string; icon: React.ReactNode; className: string }> = {
  added: { label: "Added", icon: <Plus size={14} aria-hidden />, className: "bg-added-soft text-added" },
  removed: { label: "Removed", icon: <Minus size={14} aria-hidden />, className: "bg-removed-soft text-removed" },
  changed: { label: "Changed", icon: <PenLine size={14} aria-hidden />, className: "bg-changed-soft text-changed" },
};

function ParseError({ side, parsed }: { side: string; parsed: ParseResult | null }) {
  if (!parsed || parsed.ok) return null;
  return (
    <p className="text-[13px] text-danger">
      <span className="font-semibold">{side} JSON is invalid:</span> {parsed.error.message} (line {parsed.error.line}, column{" "}
      {parsed.error.column}).
    </p>
  );
}

function DiffRow({ entry, onCopy }: { entry: DiffEntry; onCopy: (path: string) => void }) {
  const style = KIND_STYLE[entry.kind];
  return (
    <li className="grid gap-2 border-b border-border px-3 py-2.5 last:border-b-0 md:grid-cols-[120px_minmax(0,1fr)]">
      <span className={`inline-flex h-6 w-fit items-center gap-1 rounded-full px-2 text-xs font-semibold ${style.className}`}>
        {style.icon}
        {style.label}
      </span>
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <code className="min-w-0 font-mono text-[13px] font-semibold break-all text-fg">{entry.path}</code>
          <button
            type="button"
            onClick={() => onCopy(entry.path)}
            aria-label={`Copy path ${entry.path}`}
            title="Copy path"
            className="shrink-0 rounded p-1 text-subtle hover:text-fg"
          >
            <Copy size={13} aria-hidden />
          </button>
        </div>
        {entry.left !== undefined && (
          <div className="font-mono text-[12.5px] break-all">
            <span className="mr-2 text-removed select-none" aria-label="Left value">−</span>
            <span className="rounded bg-removed-soft px-1 text-fg">{entry.left}</span>
          </div>
        )}
        {entry.right !== undefined && (
          <div className="font-mono text-[12.5px] break-all">
            <span className="mr-2 text-added select-none" aria-label="Right value">+</span>
            <span className="rounded bg-added-soft px-1 text-fg">{entry.right}</span>
          </div>
        )}
      </div>
    </li>
  );
}

export function DiffTool() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const leftParsed = useParsedJson(left);
  const rightParsed = useParsedJson(right);
  const leftEditor = useRef<CodeEditorHandle>(null);
  const rightEditor = useRef<CodeEditorHandle>(null);
  const { copy } = useCopy();
  const [copied, setCopied] = useState("");

  const diff = useMemo(() => {
    if (!leftParsed?.ok || !rightParsed?.ok) return null;
    return diffJson(leftParsed.node, rightParsed.node);
  }, [leftParsed, rightParsed]);

  const visible = diff ? (filter === "all" ? diff.entries : diff.entries.filter((e) => e.kind === filter)) : [];
  const total = diff ? diff.counts.added + diff.counts.removed + diff.counts.changed : 0;

  const onCopy = (path: string) => {
    void copy(path);
    setCopied(path);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-card">
        <Button
          size="sm"
          icon={<FlaskConical size={15} aria-hidden />}
          onClick={() => {
            setLeft(sampleDiffLeft);
            setRight(sampleDiffRight);
          }}
        >
          Load example
        </Button>
        <Button
          size="sm"
          icon={<ArrowLeftRight size={15} aria-hidden />}
          onClick={() => {
            setLeft(right);
            setRight(left);
          }}
          disabled={!left && !right}
        >
          Swap sides
        </Button>
        <p className="ml-auto text-[13px] text-muted">Key order and whitespace are ignored.</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <InputPanel
          title="Original JSON"
          value={left}
          onChange={setLeft}
          errorPosition={leftParsed && !leftParsed.ok ? leftParsed.error.position : null}
          editorRef={leftEditor}
          editorClassName="h-[320px] md:h-[400px]"
          placeholder="Paste the original JSON…"
        />
        <InputPanel
          title="Changed JSON"
          value={right}
          onChange={setRight}
          errorPosition={rightParsed && !rightParsed.ok ? rightParsed.error.position : null}
          editorRef={rightEditor}
          editorClassName="h-[320px] md:h-[400px]"
          placeholder="Paste the changed JSON…"
        />
      </div>

      <section aria-labelledby="diff-results" className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-2 px-3 py-2">
          <h2 id="diff-results" className="text-[13px] font-semibold tracking-wide uppercase">
            Differences
          </h2>
          {diff && !diff.identical && (
            <Segmented
              label="Show"
              hideLabel
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: `All (${total.toLocaleString()})` },
                { value: "added", label: `Added (${diff.counts.added.toLocaleString()})` },
                { value: "removed", label: `Removed (${diff.counts.removed.toLocaleString()})` },
                { value: "changed", label: `Changed (${diff.counts.changed.toLocaleString()})` },
              ]}
            />
          )}
        </header>
        <div role="status" aria-live="polite" className="sr-only">
          {diff ? (diff.identical ? "The documents are identical." : `${total} differences found.`) : ""}
        </div>
        {!leftParsed || !rightParsed ? (
          <p className="px-3 py-8 text-center text-sm text-muted">Paste JSON into both panels to compare them.</p>
        ) : !diff ? (
          <div className="space-y-1 px-3 py-4">
            <ParseError side="Original" parsed={leftParsed} />
            <ParseError side="Changed" parsed={rightParsed} />
          </div>
        ) : diff.identical ? (
          <p className="flex items-center justify-center gap-2 px-3 py-8 text-sm font-medium text-success">
            <CheckCircle2 size={18} aria-hidden /> The documents are identical.
          </p>
        ) : (
          <>
            <ul className="max-h-[520px] overflow-auto">
              {visible.map((entry, i) => (
                <DiffRow key={`${entry.path}-${i}`} entry={entry} onCopy={onCopy} />
              ))}
            </ul>
            {diff.truncated && (
              <p className="border-t border-border px-3 py-2 text-[13px] text-muted">
                Showing the first {diff.entries.length.toLocaleString()} differences. Counts include all {total.toLocaleString()}.
              </p>
            )}
          </>
        )}
        <p className="border-t border-border px-3 py-1.5 font-mono text-xs text-muted empty:hidden" aria-live="polite">
          {copied ? `Copied ${copied}` : ""}
        </p>
      </section>
    </div>
  );
}
