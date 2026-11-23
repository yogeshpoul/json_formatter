import type { JsonNode } from "./types";

export interface XmlOptions {
  rootName: string;
  itemName: string;
  indent: "2" | "4" | "tab";
  declaration: boolean;
}

export type XmlResult =
  | { ok: true; xml: string; renamedKeys: string[]; replacedCharacters: number }
  | { ok: false; error: string };

const NAME_START = /[A-Za-z_\p{L}]/u;
const NAME_CHAR = /[A-Za-z0-9_.\-\p{L}\p{N}]/u;
const REPLACEMENT_CHAR = String.fromCharCode(0xfffd);

/** Characters that are not allowed anywhere in an XML 1.0 document. */
function isInvalidXmlChar(code: number): boolean {
  return (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) || code === 0xfffe || code === 0xffff;
}

export function toXmlName(key: string): string {
  let name = "";
  for (const ch of key) name += NAME_CHAR.test(ch) ? ch : "_";
  if (name === "" || !NAME_START.test(name[0])) name = `_${name}`;
  return name;
}

export function isValidXmlName(name: string): boolean {
  return name !== "" && toXmlName(name) === name;
}

/**
 * Converts JSON to XML.
 * - Object keys become elements (invalid characters are replaced with `_`
 *   and reported in `renamedKeys`).
 * - Arrays inside objects repeat the element once per item.
 * - Top-level arrays and arrays nested directly in arrays use `itemName`.
 * - `null`, empty objects and empty arrays become self-closing elements.
 */
export function jsonToXml(node: JsonNode, options: XmlOptions): XmlResult {
  if (!isValidXmlName(options.rootName)) {
    return { ok: false, error: `"${options.rootName}" is not a valid XML element name` };
  }
  if (!isValidXmlName(options.itemName)) {
    return { ok: false, error: `"${options.itemName}" is not a valid XML element name` };
  }
  const unit = options.indent === "tab" ? "\t" : " ".repeat(Number(options.indent));
  const renamed = new Set<string>();
  let replacedCharacters = 0;
  const out: string[] = [];

  const replaceInvalid = (s: string) => {
    let out = "";
    let start = 0;
    for (let i = 0; i < s.length; i++) {
      if (isInvalidXmlChar(s.charCodeAt(i))) {
        out += s.slice(start, i) + REPLACEMENT_CHAR;
        start = i + 1;
        replacedCharacters++;
      }
    }
    return start === 0 ? s : out + s.slice(start);
  };

  const escapeText = (s: string) =>
    replaceInvalid(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const nameFor = (key: string) => {
    const name = toXmlName(key);
    if (name !== key) renamed.add(key);
    return name;
  };

  const writeElement = (name: string, n: JsonNode, depth: number) => {
    const pad = unit.repeat(depth);
    switch (n.kind) {
      case "object": {
        if (n.entries.length === 0) {
          out.push(`${pad}<${name}/>`);
          return;
        }
        out.push(`${pad}<${name}>`);
        for (const { key, value } of n.entries) {
          const child = nameFor(key);
          if (value.kind === "array" && value.items.length > 0) {
            for (const item of value.items) writeElement(child, item, depth + 1);
          } else {
            writeElement(child, value, depth + 1);
          }
        }
        out.push(`${pad}</${name}>`);
        return;
      }
      case "array": {
        if (n.items.length === 0) {
          out.push(`${pad}<${name}/>`);
          return;
        }
        out.push(`${pad}<${name}>`);
        for (const item of n.items) writeElement(options.itemName, item, depth + 1);
        out.push(`${pad}</${name}>`);
        return;
      }
      case "null":
        out.push(`${pad}<${name}/>`);
        return;
      case "string":
        out.push(`${pad}<${name}>${escapeText(n.value)}</${name}>`);
        return;
      case "number":
        out.push(`${pad}<${name}>${n.raw}</${name}>`);
        return;
      case "boolean":
        out.push(`${pad}<${name}>${n.value}</${name}>`);
        return;
    }
  };

  if (options.declaration) out.push('<?xml version="1.0" encoding="UTF-8"?>');
  writeElement(options.rootName, node, 0);
  return { ok: true, xml: out.join("\n"), renamedKeys: [...renamed], replacedCharacters };
}
