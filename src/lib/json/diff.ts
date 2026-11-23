import { stringifyNode } from "./format";
import { appendIndex, appendKey, ROOT_PATH } from "./path";
import type { JsonNode, JsonObjectNode } from "./types";

export type DiffKind = "added" | "removed" | "changed";

export interface DiffEntry {
  kind: DiffKind;
  path: string;
  /** Compact JSON of the left value (absent for `added`). */
  left?: string;
  /** Compact JSON of the right value (absent for `removed`). */
  right?: string;
}

export interface DiffResult {
  entries: DiffEntry[];
  counts: Record<DiffKind, number>;
  truncated: boolean;
  identical: boolean;
}

const MAX_PREVIEW = 300;

function preview(node: JsonNode): string {
  const s = stringifyNode(node, { indent: "minify" });
  return s.length > MAX_PREVIEW ? `${s.slice(0, MAX_PREVIEW)}…` : s;
}

const INTEGER = /^-?\d+$/;

export function numbersEqual(a: string, b: string): boolean {
  if (a === b) return true;
  if (INTEGER.test(a) && INTEGER.test(b)) return BigInt(a) === BigInt(b);
  return Number(a) === Number(b);
}

function scalarEqual(a: JsonNode, b: JsonNode): boolean {
  if (a.kind === "string" && b.kind === "string") return a.value === b.value;
  if (a.kind === "number" && b.kind === "number") return numbersEqual(a.raw, b.raw);
  if (a.kind === "boolean" && b.kind === "boolean") return a.value === b.value;
  return a.kind === "null" && b.kind === "null";
}

/** Builds a key map; for duplicate keys the last value wins, like JSON.parse. */
function entryMap(node: JsonObjectNode): Map<string, JsonNode> {
  const map = new Map<string, JsonNode>();
  for (const e of node.entries) map.set(e.key, e.value);
  return map;
}

/**
 * Structural diff of two JSON documents. Object key order is ignored;
 * arrays are compared index by index. Numbers are compared by value
 * (`1.0` equals `1`), with exact comparison for large integers.
 */
export function diffJson(left: JsonNode, right: JsonNode, maxEntries = 5000): DiffResult {
  const entries: DiffEntry[] = [];
  const counts: Record<DiffKind, number> = { added: 0, removed: 0, changed: 0 };
  let truncated = false;

  const push = (entry: DiffEntry) => {
    counts[entry.kind]++;
    if (entries.length < maxEntries) entries.push(entry);
    else truncated = true;
  };

  const walk = (a: JsonNode, b: JsonNode, path: string) => {
    if (a.kind === "object" && b.kind === "object") {
      const am = entryMap(a);
      const bm = entryMap(b);
      for (const [key, av] of am) {
        const bv = bm.get(key);
        const p = appendKey(path, key);
        if (bv === undefined) push({ kind: "removed", path: p, left: preview(av) });
        else walk(av, bv, p);
      }
      for (const [key, bv] of bm) {
        if (!am.has(key)) push({ kind: "added", path: appendKey(path, key), right: preview(bv) });
      }
      return;
    }
    if (a.kind === "array" && b.kind === "array") {
      const shared = Math.min(a.items.length, b.items.length);
      for (let i = 0; i < shared; i++) walk(a.items[i], b.items[i], appendIndex(path, i));
      for (let i = shared; i < a.items.length; i++) {
        push({ kind: "removed", path: appendIndex(path, i), left: preview(a.items[i]) });
      }
      for (let i = shared; i < b.items.length; i++) {
        push({ kind: "added", path: appendIndex(path, i), right: preview(b.items[i]) });
      }
      return;
    }
    if (a.kind !== b.kind || !scalarEqual(a, b)) {
      push({ kind: "changed", path, left: preview(a), right: preview(b) });
    }
  };

  walk(left, right, ROOT_PATH);
  const total = counts.added + counts.removed + counts.changed;
  return { entries, counts, truncated, identical: total === 0 };
}
