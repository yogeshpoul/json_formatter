"use client";

import { Braces, Check, Copy, Download, Keyboard, Minimize2, RotateCcw, ShieldCheck } from "lucide-react";
import { useId, useRef, useState } from "react";
import { CodeEditor, type CodeEditorHandle } from "@/components/editor/CodeEditor";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Segmented } from "@/components/ui/Segmented";
import { sampleJson } from "@/content/samples";
import { useValidityAnnouncement } from "@/hooks/useAnnouncement";
import { useCopy } from "@/hooks/useCopy";
import { useJsonProcessor } from "@/hooks/useJsonProcessor";
import { useShortcuts } from "@/hooks/useShortcuts";
import { downloadText } from "@/lib/browser";
import type { IndentOption } from "@/lib/json/types";
import { InputPanel, type InputPanelHandle } from "./InputPanel";
import { Panel } from "./Panel";
import { StatusBar, type StatusState } from "./StatusBar";
import { ValidationReport } from "./ValidationReport";

export type WorkbenchMode = "format" | "validate" | "minify" | "beautify";

type PrettyIndent = Exclude<IndentOption, "minify">;
type OutputStyle = "pretty" | "minify";
type OutputTab = "output" | "report";

const INDENT_OPTIONS: { value: PrettyIndent; label: string }[] = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab" },
];

function defaultsFor(mode: WorkbenchMode) {
  return {
    style: (mode === "minify" ? "minify" : "pretty") as OutputStyle,
    tab: (mode === "validate" ? "report" : "output") as OutputTab,
  };
}

/**
 * The main JSON editor: input on the left, formatted output or validation
 * report on the right. All processing happens in this browser tab.
 */
export function JsonWorkbench({ mode }: { mode: WorkbenchMode }) {
  const defaults = defaultsFor(mode);
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<PrettyIndent>("2");
  const [style, setStyle] = useState<OutputStyle>(defaults.style);
  const [sortKeys, setSortKeys] = useState(false);
  const [tab, setTab] = useState<OutputTab>(defaults.tab);
  const [validateClicks, setValidateClicks] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const inputEditor = useRef<CodeEditorHandle>(null);
  const inputPanel = useRef<InputPanelHandle>(null);
  const tabsId = useId();
  const { status: copyStatus, copy } = useCopy();

  const options = { indent: style === "minify" ? ("minify" as const) : indent, sortKeys };
  const { result, busy, runNow } = useJsonProcessor(input, options);

  const isEmpty = input.trim() === "";
  const current = isEmpty ? null : result;
  const output = current?.ok ? current.output : "";
  const errorPosition = current && !current.ok ? current.error.position : null;

  const validity = isEmpty ? "empty" : !current ? null : current.ok ? "valid" : "invalid";
  const announcementText = !current
    ? ""
    : current.ok
      ? "Valid JSON."
      : `Invalid JSON: ${current.error.message}. Line ${current.error.line}, column ${current.error.column}.`;
  const announcement = useValidityAnnouncement(validity, announcementText, validateClicks);

  const goTo = (position: number) => inputEditor.current?.goTo(position);

  const format = () => {
    setStyle("pretty");
    setTab("output");
  };
  const minify = () => {
    setStyle("minify");
    setTab("output");
  };
  const validate = () => {
    runNow();
    setTab("report");
    setValidateClicks((n) => n + 1);
  };
  const download = () => {
    if (!output) return;
    downloadText(output, style === "minify" ? "minified.json" : "formatted.json", "application/json");
  };
  const reset = () => {
    setInput("");
    setIndent("2");
    setSortKeys(false);
    setStyle(defaults.style);
    setTab(defaults.tab);
  };

  useShortcuts([
    { key: "enter", handler: format },
    { key: "enter", shift: true, handler: minify },
    { key: "s", handler: download },
    { key: "o", handler: () => inputPanel.current?.openFilePicker() },
  ]);

  let status: StatusState;
  if (isEmpty) status = { kind: "empty" };
  else if (!current || busy) status = { kind: "busy" };
  else if (current.ok) status = { kind: "valid", stats: current.stats, warnings: current.warnings.length };
  else status = { kind: "invalid", error: current.error };

  const primary = mode === "minify" ? "minify" : mode === "validate" ? "validate" : "format";

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Formatting options"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-card"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant={primary === "format" ? "primary" : "secondary"}
            icon={<Braces size={16} aria-hidden />}
            onClick={format}
            aria-keyshortcuts="Control+Enter Meta+Enter"
          >
            {mode === "beautify" ? "Beautify" : "Format"}
          </Button>
          <Button
            variant={primary === "minify" ? "primary" : "secondary"}
            icon={<Minimize2 size={16} aria-hidden />}
            onClick={minify}
            aria-keyshortcuts="Control+Shift+Enter Meta+Shift+Enter"
          >
            Minify
          </Button>
          <Button
            variant={primary === "validate" ? "primary" : "secondary"}
            icon={<ShieldCheck size={16} aria-hidden />}
            onClick={validate}
          >
            Validate
          </Button>
        </div>
        <Segmented
          label="Indent"
          value={indent}
          options={INDENT_OPTIONS}
          onChange={(v) => {
            setIndent(v);
            setStyle("pretty");
          }}
        />
        <Checkbox
          label="Sort keys A–Z"
          checked={sortKeys}
          onChange={setSortKeys}
          description="Sort object keys alphabetically at every level. Array order is never changed."
        />
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            icon={<Keyboard size={15} aria-hidden />}
            aria-expanded={showShortcuts}
            aria-controls={`${tabsId}-shortcuts`}
            onClick={() => setShowShortcuts((s) => !s)}
          >
            Shortcuts
          </Button>
          <Button size="sm" variant="ghost" icon={<RotateCcw size={15} aria-hidden />} onClick={reset}>
            Reset
          </Button>
        </div>
        {showShortcuts && (
          <ul
            id={`${tabsId}-shortcuts`}
            className="grid w-full gap-x-6 gap-y-1 border-t border-border pt-2 text-[13px] text-muted sm:grid-cols-2 lg:grid-cols-3"
          >
            <li><Kbd>Ctrl/⌘ + Enter</Kbd> Format</li>
            <li><Kbd>Ctrl/⌘ + Shift + Enter</Kbd> Minify</li>
            <li><Kbd>Ctrl/⌘ + S</Kbd> Download output</li>
            <li><Kbd>Ctrl/⌘ + O</Kbd> Open a file</li>
            <li><Kbd>Ctrl/⌘ + F</Kbd> Search in editor</li>
            <li><Kbd>Esc</Kbd> then <Kbd>Tab</Kbd> Leave the editor</li>
          </ul>
        )}
      </div>

      {/* Editors */}
      <div className="grid gap-3 lg:grid-cols-2">
        <InputPanel
          title="Input"
          value={input}
          onChange={setInput}
          sample={sampleJson}
          errorPosition={errorPosition}
          editorRef={inputEditor}
          panelRef={inputPanel}
        />
        <Panel
          title={
            <span role="tablist" aria-label="Result view" className="inline-flex gap-1 normal-case tracking-normal">
              <TabButton id={`${tabsId}-output`} controls={`${tabsId}-panel`} selected={tab === "output"} onSelect={() => setTab("output")}>
                {style === "minify" ? "Minified output" : "Formatted output"}
              </TabButton>
              <TabButton id={`${tabsId}-report`} controls={`${tabsId}-panel`} selected={tab === "report"} onSelect={() => setTab("report")}>
                Validation
              </TabButton>
            </span>
          }
          actions={
            <>
              <Button
                size="sm"
                variant="ghost"
                icon={copyStatus === "copied" ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
                onClick={() => copy(output)}
                disabled={!output}
              >
                {copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Copy failed" : "Copy"}
              </Button>
              <Button size="sm" variant="ghost" icon={<Download size={15} aria-hidden />} onClick={download} disabled={!output}>
                Download
              </Button>
              <span className="sr-only" aria-live="polite">
                {copyStatus === "copied" ? "Output copied to clipboard" : ""}
              </span>
            </>
          }
        >
          <div
            id={`${tabsId}-panel`}
            role="tabpanel"
            aria-labelledby={tab === "output" ? `${tabsId}-output` : `${tabsId}-report`}
            className="h-[380px] overflow-auto md:h-[520px]"
          >
            {tab === "output" ? (
              current && !current.ok ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
                  <p className="font-medium text-danger">Fix the error to see the {style === "minify" ? "minified" : "formatted"} output.</p>
                  <p className="text-sm text-muted">
                    {current.empty ? "The input is empty." : `${current.error.message} (line ${current.error.line}, column ${current.error.column}).`}
                  </p>
                  {!current.empty && (
                    <Button size="sm" onClick={() => goTo(current.error.position)}>
                      Go to error
                    </Button>
                  )}
                </div>
              ) : (
                <CodeEditor
                  value={output}
                  readOnly
                  ariaLabel={style === "minify" ? "Minified JSON output" : "Formatted JSON output"}
                  placeholder="Formatted JSON will appear here"
                  lineWrapping={style === "minify"}
                  className="h-full"
                />
              )
            ) : (
              <ValidationReport input={input} result={current} onGoTo={goTo} />
            )}
          </div>
        </Panel>
      </div>

      <StatusBar state={status} onGoTo={goTo} announcement={announcement} />
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mr-1 rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-fg">{children}</kbd>
  );
}

function TabButton({
  id,
  controls,
  selected,
  onSelect,
  children,
}: {
  id: string;
  controls: string;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={controls}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          const sibling = (e.key === "ArrowRight" ? e.currentTarget.nextElementSibling : e.currentTarget.previousElementSibling) as HTMLButtonElement | null;
          sibling?.focus();
          sibling?.click();
        }
      }}
      className={`rounded-md px-2.5 py-1 text-[13px] font-semibold transition-colors ${
        selected ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
