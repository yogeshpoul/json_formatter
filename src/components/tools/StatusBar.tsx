"use client";

import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { formatBytes } from "@/lib/json/process";
import type { JsonErrorInfo, JsonStats } from "@/lib/json/types";
import { describeRoot } from "./ValidationReport";

type StatusState =
  | { kind: "empty" }
  | { kind: "busy" }
  | { kind: "valid"; stats?: JsonStats; warnings?: number; extra?: ReactNode }
  | { kind: "invalid"; error: JsonErrorInfo };

interface StatusBarProps {
  state: StatusState;
  onGoTo?: (position: number) => void;
  /** Screen reader announcement; updated only on meaningful changes. */
  announcement?: string;
}

export function StatusBar({ state, onGoTo, announcement }: StatusBarProps) {
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-border bg-surface px-3 py-2 text-[13px] shadow-card">
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
      {state.kind === "empty" && <span className="text-muted">Waiting for input</span>}
      {state.kind === "busy" && (
        <span className="inline-flex items-center gap-1.5 text-muted">
          <Loader2 size={15} className="animate-spin" aria-hidden /> Processing large input…
        </span>
      )}
      {state.kind === "valid" && (
        <>
          <span className="inline-flex items-center gap-1.5 font-semibold text-success">
            <CheckCircle2 size={15} aria-hidden /> Valid JSON
          </span>
          {state.stats && (
            <>
              <span className="text-muted">{describeRoot(state.stats)}</span>
              <span className="text-muted">Depth {state.stats.maxDepth}</span>
              <span className="text-muted">
                {formatBytes(state.stats.inputBytes)}
                {state.stats.outputBytes !== undefined && <> → {formatBytes(state.stats.outputBytes)}</>}
              </span>
            </>
          )}
          {!!state.warnings && (
            <span className="inline-flex items-center gap-1 text-warning">
              <AlertTriangle size={14} aria-hidden />
              {state.warnings === 1 ? "1 warning" : `${state.warnings} warnings`}
            </span>
          )}
          {state.extra}
        </>
      )}
      {state.kind === "invalid" && (
        <>
          <span className="inline-flex items-center gap-1.5 font-semibold text-danger">
            <XCircle size={15} aria-hidden /> Invalid JSON
          </span>
          <span className="min-w-0 break-words text-fg">{state.error.message}</span>
          {onGoTo ? (
            <button
              type="button"
              onClick={() => onGoTo(state.error.position)}
              className="font-medium text-accent-text underline underline-offset-2"
            >
              Line {state.error.line}, column {state.error.column}
            </button>
          ) : (
            <span className="text-muted">
              Line {state.error.line}, column {state.error.column}
            </span>
          )}
        </>
      )}
    </div>
  );
}

export type { StatusState };
