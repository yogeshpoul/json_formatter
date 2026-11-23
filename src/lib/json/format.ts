import type { FormatOptions, IndentOption, JsonEntry, JsonNode } from "./types";

export function indentUnit(indent: IndentOption): string {
  switch (indent) {
    case "2":
      return "  ";
    case "4":
      return "    ";
    case "tab":
      return "\t";
    case "minify":
      return "";
  }
}

/** Compares keys by UTF-16 code units, the same order as `Array.prototype.sort()`. */
function compareKeys(a: JsonEntry, b: JsonEntry): number {
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
}

/**
 * Returns a copy of the tree with object keys sorted alphabetically at every
 * level. Array order is never changed. The sort is stable, so duplicate keys
 * keep their relative order.
 */
export function sortNodeKeys(node: JsonNode): JsonNode {
  if (node.kind === "object") {
    return {
      kind: "object",
      entries: node.entries
        .map((e) => ({ ...e, value: sortNodeKeys(e.value) }))
        .sort(compareKeys),
    };
  }
  if (node.kind === "array") {
    return { kind: "array", items: node.items.map(sortNodeKeys) };
  }
  return node;
}

/**
 * Serialises a syntax tree. Numbers, strings and keys are written exactly as
 * they appeared in the source, so values are never altered.
 * Output layout matches `JSON.stringify(value, null, indent)`.
 */
export function stringifyNode(node: JsonNode, options: FormatOptions): string {
  const root = options.sortKeys ? sortNodeKeys(node) : node;
  const unit = indentUnit(options.indent);
  const out: string[] = [];

  if (unit === "") {
    writeCompact(root, out);
    return out.join("");
  }

  const indents: string[] = [""];
  const indentAt = (depth: number) => {
    while (indents.length <= depth) indents.push(indents[indents.length - 1] + unit);
    return indents[depth];
  };

  const write = (n: JsonNode, depth: number) => {
    switch (n.kind) {
      case "object": {
        if (n.entries.length === 0) {
          out.push("{}");
          return;
        }
        const inner = "\n" + indentAt(depth + 1);
        out.push("{");
        for (let i = 0; i < n.entries.length; i++) {
          const entry = n.entries[i];
          out.push(i === 0 ? inner : "," + inner, entry.rawKey, ": ");
          write(entry.value, depth + 1);
        }
        out.push("\n", indentAt(depth), "}");
        return;
      }
      case "array": {
        if (n.items.length === 0) {
          out.push("[]");
          return;
        }
        const inner = "\n" + indentAt(depth + 1);
        out.push("[");
        for (let i = 0; i < n.items.length; i++) {
          out.push(i === 0 ? inner : "," + inner);
          write(n.items[i], depth + 1);
        }
        out.push("\n", indentAt(depth), "]");
        return;
      }
      default:
        out.push(scalarToString(n));
    }
  };

  write(root, 0);
  return out.join("");
}

function writeCompact(n: JsonNode, out: string[]) {
  switch (n.kind) {
    case "object":
      out.push("{");
      for (let i = 0; i < n.entries.length; i++) {
        if (i > 0) out.push(",");
        out.push(n.entries[i].rawKey, ":");
        writeCompact(n.entries[i].value, out);
      }
      out.push("}");
      return;
    case "array":
      out.push("[");
      for (let i = 0; i < n.items.length; i++) {
        if (i > 0) out.push(",");
        writeCompact(n.items[i], out);
      }
      out.push("]");
      return;
    default:
      out.push(scalarToString(n));
  }
}

export function scalarToString(n: JsonNode): string {
  switch (n.kind) {
    case "string":
    case "number":
      return n.raw;
    case "boolean":
      return n.value ? "true" : "false";
    case "null":
      return "null";
    default:
      return stringifyNode(n, { indent: "minify" });
  }
}
