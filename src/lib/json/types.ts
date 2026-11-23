/**
 * Lossless JSON syntax tree.
 *
 * Unlike the value returned by `JSON.parse`, this tree keeps the original
 * source text of numbers and strings, so re-serialising it never changes a
 * value (e.g. large integers keep every digit, `1.50` stays `1.50`).
 */
export type JsonNode =
  | JsonObjectNode
  | JsonArrayNode
  | JsonStringNode
  | JsonNumberNode
  | JsonBooleanNode
  | JsonNullNode;

export interface JsonObjectNode {
  kind: "object";
  entries: JsonEntry[];
}

export interface JsonEntry {
  /** Decoded key. */
  key: string;
  /** Key exactly as written in the source, including quotes. */
  rawKey: string;
  value: JsonNode;
}

export interface JsonArrayNode {
  kind: "array";
  items: JsonNode[];
}

export interface JsonStringNode {
  kind: "string";
  /** Decoded string value. */
  value: string;
  /** String literal exactly as written in the source, including quotes. */
  raw: string;
}

export interface JsonNumberNode {
  kind: "number";
  /** Number literal exactly as written in the source. */
  raw: string;
}

export interface JsonBooleanNode {
  kind: "boolean";
  value: boolean;
}

export interface JsonNullNode {
  kind: "null";
}

export type JsonKind = JsonNode["kind"];

export interface JsonErrorInfo {
  message: string;
  /** Zero-based character offset into the input. */
  position: number;
  /** One-based line number. */
  line: number;
  /** One-based column number. */
  column: number;
}

export type JsonWarningCode = "duplicate-key" | "unsafe-number";

export interface JsonWarning {
  code: JsonWarningCode;
  message: string;
  position: number;
  line: number;
  column: number;
}

export type IndentOption = "2" | "4" | "tab" | "minify";

export interface FormatOptions {
  indent: IndentOption;
  sortKeys?: boolean;
}

export interface JsonStats {
  rootType: JsonKind;
  /** Number of direct children of the root (keys or items). */
  topLevelCount: number;
  objects: number;
  arrays: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  totalKeys: number;
  maxDepth: number;
  /** Size of the input in bytes (UTF-8). */
  inputBytes: number;
  /** Size of the output in bytes (UTF-8), when output was produced. */
  outputBytes?: number;
}

export type ParseResult =
  | { ok: true; node: JsonNode; warnings: JsonWarning[] }
  | { ok: false; error: JsonErrorInfo };

export type ProcessResult =
  | {
      ok: true;
      output: string;
      stats: JsonStats;
      warnings: JsonWarning[];
    }
  | { ok: false; error: JsonErrorInfo; empty: boolean };
