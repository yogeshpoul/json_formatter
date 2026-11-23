import { stringifyNode } from "./format";
import { parseJson } from "./parser";
import type { FormatOptions, JsonNode, JsonStats, ProcessResult } from "./types";

export function utf8ByteLength(text: string): number {
  // Counting manually avoids allocating a copy of large inputs.
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 0x80) bytes += 1;
    else if (c < 0x800) bytes += 2;
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < text.length) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        i++;
      } else bytes += 3;
    } else bytes += 3;
  }
  return bytes;
}

export function computeStats(node: JsonNode, inputBytes: number): JsonStats {
  const stats: JsonStats = {
    rootType: node.kind,
    topLevelCount: node.kind === "object" ? node.entries.length : node.kind === "array" ? node.items.length : 0,
    objects: 0,
    arrays: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    totalKeys: 0,
    maxDepth: 0,
    inputBytes,
  };

  // Iterative walk so very deep documents cannot overflow the stack here.
  const stack: [JsonNode, number][] = [[node, 0]];
  while (stack.length > 0) {
    const [n, depth] = stack.pop()!;
    if (depth > stats.maxDepth) stats.maxDepth = depth;
    switch (n.kind) {
      case "object":
        stats.objects++;
        stats.totalKeys += n.entries.length;
        for (const e of n.entries) stack.push([e.value, depth + 1]);
        break;
      case "array":
        stats.arrays++;
        for (const item of n.items) stack.push([item, depth + 1]);
        break;
      case "string":
        stats.strings++;
        break;
      case "number":
        stats.numbers++;
        break;
      case "boolean":
        stats.booleans++;
        break;
      case "null":
        stats.nulls++;
        break;
    }
  }
  return stats;
}

/**
 * Validates and formats JSON in one step. Pure function: no I/O, no globals,
 * safe to run on the main thread or inside a Web Worker.
 */
export function processJson(input: string, options: FormatOptions): ProcessResult {
  const parsed = parseJson(input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, empty: input.trim() === "" };
  }
  let output: string;
  try {
    output = stringifyNode(parsed.node, options);
  } catch (err) {
    if (err instanceof RangeError) {
      return {
        ok: false,
        empty: false,
        error: { message: "JSON is nested too deeply to be formatted in the browser", position: 0, line: 1, column: 1 },
      };
    }
    throw err;
  }
  const stats = computeStats(parsed.node, utf8ByteLength(input));
  stats.outputBytes = utf8ByteLength(output);
  return { ok: true, output, stats, warnings: parsed.warnings };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
