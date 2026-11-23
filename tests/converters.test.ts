import { describe, expect, it } from "vitest";
import {
  diffJson,
  escapeJsonString,
  jsonToCsv,
  jsonToXml,
  parseJson,
  toXmlName,
  unescapeJsonString,
  type JsonNode,
} from "@/lib/json";

function node(input: string): JsonNode {
  const r = parseJson(input);
  if (!r.ok) throw new Error(r.error.message);
  return r.node;
}

describe("JSON to CSV", () => {
  const opts = { delimiter: "," as const, flatten: true, includeHeader: true };

  it("converts an array of objects with a union of columns", () => {
    const r = jsonToCsv(node('[{"a":1,"b":"x"},{"b":"y","c":true}]'), opts);
    expect(r.ok && r.csv).toBe("a,b,c\r\n1,x,\r\n,y,true");
  });

  it("flattens nested objects and arrays", () => {
    const r = jsonToCsv(node('[{"u":{"name":"A","tags":["x","y"]}}]'), opts);
    expect(r.ok && r.csv).toBe("u.name,u.tags[0],u.tags[1]\r\nA,x,y");
  });

  it("keeps nested values as JSON when flattening is off", () => {
    const r = jsonToCsv(node('[{"u":{"n":1}}]'), { ...opts, flatten: false });
    expect(r.ok && r.csv).toBe('u\r\n"{""n"":1}"');
  });

  it("quotes cells containing delimiters, quotes and newlines", () => {
    const r = jsonToCsv(node('[{"a":"x,y","b":"say \\"hi\\"","c":"l1\\nl2"}]'), opts);
    expect(r.ok && r.csv).toBe('a,b,c\r\n"x,y","say ""hi""","l1\nl2"');
  });

  it("supports semicolon and tab delimiters", () => {
    expect(jsonToCsv(node('[{"a":1,"b":2}]'), { ...opts, delimiter: ";" })).toMatchObject({ csv: "a;b\r\n1;2" });
    expect(jsonToCsv(node('[{"a":1,"b":2}]'), { ...opts, delimiter: "\t" })).toMatchObject({ csv: "a\tb\r\n1\t2" });
  });

  it("handles arrays of primitives and single objects", () => {
    expect(jsonToCsv(node("[1,2]"), opts)).toMatchObject({ csv: "value\r\n1\r\n2" });
    expect(jsonToCsv(node('{"a":1}'), opts)).toMatchObject({ csv: "a\r\n1", rows: 1 });
  });

  it("preserves large integers exactly", () => {
    const r = jsonToCsv(node('[{"id":12345678901234567890}]'), opts);
    expect(r.ok && r.csv).toContain("12345678901234567890");
  });

  it("rejects scalars and empty arrays", () => {
    expect(jsonToCsv(node("42"), opts).ok).toBe(false);
    expect(jsonToCsv(node("[]"), opts).ok).toBe(false);
  });
});

describe("JSON to XML", () => {
  const opts = { rootName: "root", itemName: "item", indent: "2" as const, declaration: false };

  it("converts objects, arrays and scalars", () => {
    const r = jsonToXml(node('{"name":"A & B","tags":["x","y"],"n":null,"ok":true}'), opts);
    expect(r.ok && r.xml).toBe(
      ["<root>", "  <name>A &amp; B</name>", "  <tags>x</tags>", "  <tags>y</tags>", "  <n/>", "  <ok>true</ok>", "</root>"].join("\n"),
    );
  });

  it("wraps root arrays in item elements", () => {
    const r = jsonToXml(node("[1,{\"a\":2}]"), opts);
    expect(r.ok && r.xml).toBe("<root>\n  <item>1</item>\n  <item>\n    <a>2</a>\n  </item>\n</root>");
  });

  it("adds a declaration when requested", () => {
    const r = jsonToXml(node("{}"), { ...opts, declaration: true });
    expect(r.ok && r.xml).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<root/>');
  });

  it("renames invalid element names and reports them", () => {
    expect(toXmlName("first name")).toBe("first_name");
    expect(toXmlName("1st")).toBe("_1st");
    expect(toXmlName("")).toBe("_");
    const r = jsonToXml(node('{"first name":"A"}'), opts);
    expect(r.ok && r.renamedKeys).toEqual(["first name"]);
  });

  it("escapes markup in text", () => {
    const r = jsonToXml(node('{"html":"<b>x</b>"}'), opts);
    expect(r.ok && r.xml).toContain("&lt;b&gt;x&lt;/b&gt;");
  });

  it("rejects invalid root names", () => {
    expect(jsonToXml(node("{}"), { ...opts, rootName: "1bad" }).ok).toBe(false);
  });
});

describe("escape / unescape", () => {
  it("escapes special characters", () => {
    expect(escapeJsonString('He said "hi"\n\tC:\\path', false)).toBe('He said \\"hi\\"\\n\\tC:\\\\path');
    expect(escapeJsonString("x", true)).toBe('"x"');
  });

  it("round-trips arbitrary text", () => {
    const text = 'quotes " backslash \\ newline \n unicode 😀 control \u0001';
    const r = unescapeJsonString(escapeJsonString(text, false));
    expect(r.ok && r.value).toBe(text);
  });

  it("accepts quoted input", () => {
    expect(unescapeJsonString('"a\\nb"')).toEqual({ ok: true, value: "a\nb" });
  });

  it("reports invalid escapes", () => {
    const r = unescapeJsonString("bad \\x");
    expect(r.ok).toBe(false);
  });

  it("explains unescaped quotes", () => {
    const r = unescapeJsonString('say "hi');
    expect(!r.ok && r.error).toMatch(/unescaped double quote/i);
  });
});

describe("JSON diff", () => {
  it("detects identical documents regardless of key order", () => {
    expect(diffJson(node('{"a":1,"b":[1,2]}'), node('{"b":[1,2],"a":1}')).identical).toBe(true);
  });

  it("detects added, removed and changed values with paths", () => {
    const r = diffJson(node('{"a":1,"b":{"c":2},"arr":[1,2,3]}'), node('{"a":2,"b":{"d":2},"arr":[1,2],"new key":true}'));
    expect(r.counts).toEqual({ added: 2, removed: 2, changed: 1 });
    expect(r.entries).toContainEqual({ kind: "changed", path: "$.a", left: "1", right: "2" });
    expect(r.entries).toContainEqual({ kind: "removed", path: "$.b.c", left: "2" });
    expect(r.entries).toContainEqual({ kind: "removed", path: "$.arr[2]", left: "3" });
    expect(r.entries).toContainEqual({ kind: "added", path: '$["new key"]', right: "true" });
  });

  it("treats type changes as changes", () => {
    const r = diffJson(node('{"a":"1"}'), node('{"a":1}'));
    expect(r.counts.changed).toBe(1);
  });

  it("compares numbers by value but large integers exactly", () => {
    expect(diffJson(node("[1.0, 1e2]"), node("[1, 100]")).identical).toBe(true);
    expect(diffJson(node("[9007199254740993]"), node("[9007199254740992]")).identical).toBe(false);
  });

  it("caps the number of reported entries", () => {
    const a = JSON.stringify(Array.from({ length: 100 }, (_, i) => i));
    const b = JSON.stringify(Array.from({ length: 100 }, (_, i) => i + 1));
    const r = diffJson(node(a), node(b), 10);
    expect(r.entries).toHaveLength(10);
    expect(r.truncated).toBe(true);
    expect(r.counts.changed).toBe(100);
  });
});
