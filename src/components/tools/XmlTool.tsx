"use client";

import { AlertTriangle } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import type { CodeEditorHandle } from "@/components/editor/CodeEditor";
import { Checkbox } from "@/components/ui/Checkbox";
import { Segmented } from "@/components/ui/Segmented";
import { sampleJson } from "@/content/samples";
import { useParsedJson } from "@/hooks/useParsedJson";
import { jsonToXml } from "@/lib/json/xml";
import { InputPanel } from "./InputPanel";
import { EmptyState, ErrorState, OutputPanel } from "./OutputPanel";
import { StatusBar } from "./StatusBar";

type XmlIndent = "2" | "4" | "tab";

const INDENTS: { value: XmlIndent; label: string }[] = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab" },
];

function NameField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-[13px] text-muted">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        className="h-8 w-28 rounded-md border border-border bg-surface px-2 font-mono text-[13px] text-fg"
      />
    </div>
  );
}

export function XmlTool() {
  const [input, setInput] = useState("");
  const [rootName, setRootName] = useState("root");
  const [itemName, setItemName] = useState("item");
  const [indent, setIndent] = useState<XmlIndent>("2");
  const [declaration, setDeclaration] = useState(true);
  const parsed = useParsedJson(input);
  const inputEditor = useRef<CodeEditorHandle>(null);

  const result = useMemo(() => {
    if (!parsed?.ok) return null;
    return jsonToXml(parsed.node, { rootName: rootName.trim(), itemName: itemName.trim(), indent, declaration });
  }, [parsed, rootName, itemName, indent, declaration]);

  const overlay = !parsed ? (
    <EmptyState>Paste JSON on the left to convert it to XML.</EmptyState>
  ) : !parsed.ok ? (
    <ErrorState title="Invalid JSON" message={`${parsed.error.message} (line ${parsed.error.line}, column ${parsed.error.column}).`} />
  ) : result && !result.ok ? (
    <ErrorState title="Check the options" message={`${result.error}. Element names must start with a letter or underscore and contain no spaces.`} />
  ) : undefined;

  const notes: string[] = [];
  if (result?.ok && result.renamedKeys.length > 0) {
    const shown = result.renamedKeys.slice(0, 8).map((k) => `"${k}"`).join(", ");
    const more = result.renamedKeys.length > 8 ? ` and ${result.renamedKeys.length - 8} more` : "";
    notes.push(`${result.renamedKeys.length} key(s) are not valid XML names and were renamed: ${shown}${more}.`);
  }
  if (result?.ok && result.replacedCharacters > 0) {
    notes.push(`${result.replacedCharacters} control character(s) not allowed in XML were replaced with the Unicode replacement character (U+FFFD).`);
  }

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="XML options"
        className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-card"
      >
        <NameField label="Root element" value={rootName} onChange={setRootName} />
        <NameField label="Array item" value={itemName} onChange={setItemName} />
        <Segmented label="Indent" value={indent} options={INDENTS} onChange={setIndent} />
        <Checkbox label="XML declaration" checked={declaration} onChange={setDeclaration} />
      </div>

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
          title="XML output"
          value={result?.ok ? result.xml : ""}
          filename="data.xml"
          mimeType="application/xml"
          language="text"
          overlay={overlay}
        />
      </div>

      {notes.length > 0 && (
        <div role="note" className="flex gap-2 rounded-xl border border-warning/40 bg-warning-soft px-3 py-2 text-[13px] text-fg">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" aria-hidden />
          <div>
            {notes.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </div>
        </div>
      )}

      <StatusBar
        state={!parsed ? { kind: "empty" } : parsed.ok ? { kind: "valid", warnings: parsed.warnings.length } : { kind: "invalid", error: parsed.error }}
        onGoTo={(pos) => inputEditor.current?.goTo(pos)}
      />
    </div>
  );
}
