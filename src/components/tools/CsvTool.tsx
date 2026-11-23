"use client";

import { useMemo, useRef, useState } from "react";
import type { CodeEditorHandle } from "@/components/editor/CodeEditor";
import { Checkbox } from "@/components/ui/Checkbox";
import { Segmented } from "@/components/ui/Segmented";
import { sampleRecords } from "@/content/samples";
import { useParsedJson } from "@/hooks/useParsedJson";
import { jsonToCsv, type CsvDelimiter } from "@/lib/json/csv";
import { InputPanel } from "./InputPanel";
import { EmptyState, ErrorState, OutputPanel } from "./OutputPanel";
import { StatusBar } from "./StatusBar";

const DELIMITERS: { value: "comma" | "semicolon" | "tab"; label: string }[] = [
  { value: "comma", label: "Comma" },
  { value: "semicolon", label: "Semicolon" },
  { value: "tab", label: "Tab" },
];

const DELIMITER_CHAR: Record<(typeof DELIMITERS)[number]["value"], CsvDelimiter> = {
  comma: ",",
  semicolon: ";",
  tab: "\t",
};

export function CsvTool() {
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState<(typeof DELIMITERS)[number]["value"]>("comma");
  const [flatten, setFlatten] = useState(true);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [excelBom, setExcelBom] = useState(false);
  const parsed = useParsedJson(input);
  const inputEditor = useRef<CodeEditorHandle>(null);

  const result = useMemo(() => {
    if (!parsed?.ok) return null;
    return jsonToCsv(parsed.node, { delimiter: DELIMITER_CHAR[delimiter], flatten, includeHeader });
  }, [parsed, delimiter, flatten, includeHeader]);

  const overlay = !parsed ? (
    <EmptyState>Paste a JSON array of objects on the left to convert it to CSV.</EmptyState>
  ) : !parsed.ok ? (
    <ErrorState title="Invalid JSON" message={`${parsed.error.message} (line ${parsed.error.line}, column ${parsed.error.column}).`} />
  ) : result && !result.ok ? (
    <ErrorState title="Cannot convert to CSV" message={result.error} />
  ) : undefined;

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="CSV options"
        className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-card"
      >
        <Segmented label="Delimiter" value={delimiter} options={DELIMITERS} onChange={setDelimiter} />
        <Checkbox label="Flatten nested data" checked={flatten} onChange={setFlatten} description="Expand nested objects into dotted columns such as address.city" />
        <Checkbox label="Header row" checked={includeHeader} onChange={setIncludeHeader} />
        <Checkbox label="Excel-compatible (UTF-8 BOM)" checked={excelBom} onChange={setExcelBom} description="Adds a byte order mark to the downloaded file so Excel detects UTF-8" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <InputPanel
          title="JSON input"
          value={input}
          onChange={setInput}
          sample={sampleRecords}
          errorPosition={parsed && !parsed.ok ? parsed.error.position : null}
          editorRef={inputEditor}
        />
        <OutputPanel
          title="CSV output"
          value={result?.ok ? result.csv : ""}
          filename="data.csv"
          mimeType="text/csv"
          language="text"
          withBom={excelBom}
          overlay={overlay}
        />
      </div>

      <StatusBar
        state={
          !parsed
            ? { kind: "empty" }
            : parsed.ok
              ? {
                  kind: "valid",
                  warnings: parsed.warnings.length,
                  extra: result?.ok ? (
                    <span className="text-muted">
                      {result.rows.toLocaleString()} rows × {result.columns.toLocaleString()} columns
                    </span>
                  ) : undefined,
                }
              : { kind: "invalid", error: parsed.error }
        }
        onGoTo={(pos) => inputEditor.current?.goTo(pos)}
      />

      {result?.ok && (
        <section aria-labelledby="csv-preview" className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
          <h2 id="csv-preview" className="border-b border-border bg-surface-2 px-3 py-2.5 text-[13px] font-semibold tracking-wide uppercase">
            Table preview{" "}
            <span className="font-normal tracking-normal text-muted normal-case">
              ({result.previewRows.length < result.rows ? `first ${result.previewRows.length} of ${result.rows.toLocaleString()} rows` : `${result.rows} rows`})
            </span>
          </h2>
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead className="sticky top-0 bg-surface-2">
                <tr>
                  {result.columnNames.map((c) => (
                    <th key={c} scope="col" className="border-b border-border px-3 py-2 font-mono font-semibold whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.previewRows.map((row, i) => (
                  <tr key={i} className="odd:bg-surface even:bg-bg-subtle">
                    {row.map((cell, j) => (
                      <td key={j} className="max-w-[320px] truncate border-b border-border px-3 py-1.5 font-mono" title={cell}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
