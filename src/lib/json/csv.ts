import { stringifyNode } from "./format";
import type { JsonNode } from "./types";

export type CsvDelimiter = "," | ";" | "\t";

export interface CsvOptions {
  delimiter: CsvDelimiter;
  /** Expand nested objects/arrays into `parent.child` / `list[0]` columns. */
  flatten: boolean;
  includeHeader: boolean;
}

export type CsvResult =
  | {
      ok: true;
      csv: string;
      rows: number;
      columns: number;
      columnNames: string[];
      /** First rows as cell values, for a table preview. */
      previewRows: string[][];
    }
  | { ok: false; error: string };

type Row = Map<string, string>;

const PREVIEW_ROWS = 50;

function cellValue(node: JsonNode): string {
  switch (node.kind) {
    case "string":
      return node.value;
    case "number":
      return node.raw;
    case "boolean":
      return node.value ? "true" : "false";
    case "null":
      return "";
    default:
      return stringifyNode(node, { indent: "minify" });
  }
}

function flattenInto(node: JsonNode, prefix: string, row: Row) {
  if (node.kind === "object" && node.entries.length > 0) {
    for (const { key, value } of node.entries) {
      flattenInto(value, prefix ? `${prefix}.${key}` : key, row);
    }
    return;
  }
  if (node.kind === "array" && node.items.length > 0) {
    node.items.forEach((item, i) => flattenInto(item, `${prefix}[${i}]`, row));
    return;
  }
  row.set(prefix || "value", cellValue(node));
}

function toRow(node: JsonNode, flatten: boolean): Row {
  const row: Row = new Map();
  if (node.kind === "object") {
    for (const { key, value } of node.entries) {
      if (flatten) flattenInto(value, key, row);
      else row.set(key, cellValue(value));
    }
  } else if (node.kind === "array" && flatten) {
    flattenInto(node, "", row);
  } else {
    row.set("value", cellValue(node));
  }
  return row;
}

export function escapeCsvCell(value: string, delimiter: CsvDelimiter): string {
  const needsQuotes =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r") ||
    value !== value.trim();
  return needsQuotes ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Converts JSON to CSV (RFC 4180, CRLF line endings).
 * - An array becomes one row per item.
 * - A single object becomes one row.
 * Columns are the union of all keys, in first-seen order.
 */
export function jsonToCsv(node: JsonNode, options: CsvOptions): CsvResult {
  let records: JsonNode[];
  if (node.kind === "array") records = node.items;
  else if (node.kind === "object") records = [node];
  else return { ok: false, error: "CSV conversion needs a JSON array or object at the top level" };

  if (records.length === 0) return { ok: false, error: "The array is empty, so there are no rows to convert" };

  const rows = records.map((r) => toRow(r, options.flatten));
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const key of row.keys()) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }

  const d = options.delimiter;
  const lines: string[] = [];
  if (options.includeHeader) lines.push(columns.map((c) => escapeCsvCell(c, d)).join(d));
  for (const row of rows) {
    lines.push(columns.map((c) => escapeCsvCell(row.get(c) ?? "", d)).join(d));
  }
  const previewRows = rows.slice(0, PREVIEW_ROWS).map((row) => columns.map((c) => row.get(c) ?? ""));
  return {
    ok: true,
    csv: lines.join("\r\n"),
    rows: rows.length,
    columns: columns.length,
    columnNames: columns,
    previewRows,
  };
}
