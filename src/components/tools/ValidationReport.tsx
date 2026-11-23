"use client";

import { AlertTriangle, CheckCircle2, CornerDownRight, FileJson2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getErrorContext } from "@/lib/json/context";
import { formatBytes } from "@/lib/json/process";
import type { JsonErrorInfo, JsonStats, JsonWarning, ProcessResult } from "@/lib/json/types";

export function describeRoot(stats: JsonStats): string {
  switch (stats.rootType) {
    case "object":
      return `Object with ${stats.topLevelCount.toLocaleString()} ${stats.topLevelCount === 1 ? "key" : "keys"}`;
    case "array":
      return `Array with ${stats.topLevelCount.toLocaleString()} ${stats.topLevelCount === 1 ? "item" : "items"}`;
    default:
      return `Single ${stats.rootType} value`;
  }
}

export function StatsGrid({ stats }: { stats: JsonStats }) {
  const rows: [string, string][] = [
    ["Root", describeRoot(stats)],
    ["Total keys", stats.totalKeys.toLocaleString()],
    ["Max depth", stats.maxDepth.toLocaleString()],
    ["Objects", stats.objects.toLocaleString()],
    ["Arrays", stats.arrays.toLocaleString()],
    ["Strings", stats.strings.toLocaleString()],
    ["Numbers", stats.numbers.toLocaleString()],
    ["Booleans", stats.booleans.toLocaleString()],
    ["Nulls", stats.nulls.toLocaleString()],
    ["Input size", formatBytes(stats.inputBytes)],
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border text-[13px] sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3 bg-surface px-3 py-2">
          <dt className="text-muted">{label}</dt>
          <dd className="text-right font-medium text-fg tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function WarningList({ warnings, onGoTo }: { warnings: JsonWarning[]; onGoTo?: (position: number) => void }) {
  if (warnings.length === 0) return null;
  return (
    <div className="rounded-lg border border-warning/40 bg-warning-soft p-3">
      <h3 className="flex items-center gap-2 text-[13px] font-semibold text-warning">
        <AlertTriangle size={15} aria-hidden />
        {warnings.length === 1 ? "1 warning" : `${warnings.length} warnings`}
      </h3>
      <ul className="mt-2 space-y-1.5 text-[13px] text-fg">
        {warnings.map((w, i) => (
          <li key={i} className="flex flex-wrap items-baseline gap-x-2">
            <span>{w.message}.</span>
            {onGoTo ? (
              <button
                type="button"
                onClick={() => onGoTo(w.position)}
                className="text-xs font-medium text-accent-text underline underline-offset-2"
              >
                Line {w.line}, column {w.column}
              </button>
            ) : (
              <span className="text-xs text-muted">
                Line {w.line}, column {w.column}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ErrorExcerpt({ input, error }: { input: string; error: JsonErrorInfo }) {
  const { lines, caretColumn } = getErrorContext(input, error.line, error.column);
  const gutter = String(lines[lines.length - 1]?.number ?? 1).length;
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-surface-2 p-3 font-mono text-[12.5px] leading-relaxed" aria-hidden>
      {lines.map((line) => (
        <div key={line.number}>
          <div className={line.isErrorLine ? "text-fg" : "text-subtle"}>
            <span className="mr-3 inline-block text-right text-subtle select-none" style={{ width: `${gutter}ch` }}>
              {line.number}
            </span>
            {line.text || " "}
          </div>
          {line.isErrorLine && (
            <div className="text-danger">
              <span className="mr-3 inline-block" style={{ width: `${gutter}ch` }} />
              {" ".repeat(Math.max(0, caretColumn - 1))}^ here
            </div>
          )}
        </div>
      ))}
    </pre>
  );
}

interface ValidationReportProps {
  input: string;
  result: ProcessResult | null;
  onGoTo: (position: number) => void;
}

/** Detailed validation result shown in the right-hand panel. */
export function ValidationReport({ input, result, onGoTo }: ValidationReportProps) {
  if (!result || (!result.ok && result.empty)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-muted">
        <FileJson2 size={36} strokeWidth={1.5} aria-hidden />
        <p className="max-w-xs text-sm">Paste or upload JSON on the left. The validation report updates as you type.</p>
      </div>
    );
  }

  if (!result.ok) {
    const { error } = result;
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3 rounded-lg border border-danger/40 bg-danger-soft p-3">
          <XCircle className="mt-0.5 shrink-0 text-danger" size={20} aria-hidden />
          <div className="min-w-0">
            <p className="font-semibold text-danger">Invalid JSON</p>
            <p className="mt-1 text-sm break-words text-fg">{error.message}.</p>
            <p className="mt-1 text-[13px] text-muted">
              Line {error.line}, column {error.column}
            </p>
          </div>
        </div>
        <ErrorExcerpt input={input} error={error} />
        <Button size="sm" icon={<CornerDownRight size={15} aria-hidden />} onClick={() => onGoTo(error.position)}>
          Go to error
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-3 rounded-lg border border-success/40 bg-success-soft p-3">
        <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={20} aria-hidden />
        <div>
          <p className="font-semibold text-success">Valid JSON</p>
          <p className="mt-1 text-sm text-fg">
            {describeRoot(result.stats)}. The document follows the JSON standard (RFC 8259).
          </p>
        </div>
      </div>
      <WarningList warnings={result.warnings} onGoTo={onGoTo} />
      <StatsGrid stats={result.stats} />
    </div>
  );
}
