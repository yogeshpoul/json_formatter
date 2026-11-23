import { describe, expect, it } from "vitest";
import { parseJson, processJson, stringifyNode } from "@/lib/json";

const VALID = [
  "{}",
  "[]",
  "0",
  "-0",
  "1.5e10",
  "-1.25E-3",
  '"hello"',
  "true",
  "false",
  "null",
  '  {"a": 1}  ',
  '{"a":{"b":{"c":[1,2,{"d":null}]}}}',
  '["\\u00e9", "\\n\\t\\"\\\\\\/\\b\\f\\r", "😀"]',
  '{"":""}',
  "[[[[[]]]]]",
  '{"a":[],"b":{}}',
  "\n\t\r [1 , 2 ]\n",
];

const INVALID = [
  "{",
  "}",
  "[1,]",
  '{"a":1,}',
  "{'a':1}",
  "{a:1}",
  '{"a" 1}',
  '{"a":1 "b":2}',
  "[1 2]",
  "01",
  "1.",
  ".5",
  "+1",
  "-",
  "1e",
  "NaN",
  "Infinity",
  "-Infinity",
  "undefined",
  "True",
  '"unterminated',
  '"bad \\x escape"',
  '"bad \\u12 escape"',
  '"line\nbreak"',
  '"tab\there"',
  "// comment\n{}",
  "{} {}",
  "[1] x",
  "nul",
  "tru",
  String.fromCharCode(0xfeff) + "{}",
  "[:]",
];

describe("parseJson agrees with native JSON.parse", () => {
  it.each(VALID)("accepts %j", (input) => {
    expect(() => JSON.parse(input)).not.toThrow();
    expect(parseJson(input).ok).toBe(true);
  });

  it.each(INVALID)("rejects %j", (input) => {
    expect(() => JSON.parse(input)).toThrow();
    expect(parseJson(input).ok).toBe(false);
  });
});

describe("error reporting", () => {
  it("reports empty input", () => {
    const r = parseJson("   ");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toMatch(/empty/i);
  });

  it("reports line and column of a missing comma", () => {
    const input = '{\n  "a": 1\n  "b": 2\n}';
    const r = parseJson(input);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.line).toBe(3);
      expect(r.error.column).toBe(3);
      expect(r.error.message).toMatch(/comma/i);
    }
  });

  it("explains trailing commas", () => {
    const r = parseJson('{\n  "a": 1,\n}');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.message).toMatch(/trailing comma/i);
      expect(r.error.line).toBe(3);
      expect(r.error.column).toBe(1);
    }
  });

  it("explains single quotes", () => {
    const r = parseJson("{'a': 1}");
    if (!r.ok) expect(r.error.message).toMatch(/double quotes/i);
    else throw new Error("expected failure");
  });

  it("explains unquoted keys", () => {
    const r = parseJson("{name: 1}");
    if (!r.ok) expect(r.error.message).toMatch(/"name" must be wrapped in double quotes/);
    else throw new Error("expected failure");
  });

  it("explains comments", () => {
    const r = parseJson('{"a": 1 // note\n}');
    if (!r.ok) expect(r.error.message).toMatch(/expected ',' or '}'/i);
    const r2 = parseJson("/* x */ {}");
    if (!r2.ok) expect(r2.error.message).toMatch(/comments/i);
    else throw new Error("expected failure");
  });

  it("reports unterminated strings at the opening quote", () => {
    const r = parseJson('{"a": "abc');
    if (!r.ok) {
      expect(r.error.message).toMatch(/unterminated/i);
      expect(r.error.column).toBe(7);
    } else throw new Error("expected failure");
  });

  it("handles extremely deep nesting without crashing", () => {
    const depth = 200_000;
    const input = "[".repeat(depth) + "]".repeat(depth);
    const r = parseJson(input);
    // Either parsed or reported as too deep, but never throws.
    if (!r.ok) expect(r.error.message).toMatch(/nested too deeply/i);
  });
});

describe("warnings", () => {
  it("warns about duplicate keys and keeps both", () => {
    const r = processJson('{"a":1,"a":2}', { indent: "minify" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.warnings).toHaveLength(1);
      expect(r.warnings[0].code).toBe("duplicate-key");
      expect(r.output).toBe('{"a":1,"a":2}');
    }
  });

  it("warns about unsafe integers and preserves every digit", () => {
    const r = processJson('{"id": 12345678901234567890}', { indent: "2" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.warnings[0].code).toBe("unsafe-number");
      expect(r.output).toContain("12345678901234567890");
    }
  });

  it("does not warn for safe numbers", () => {
    const r = processJson("[9007199254740991, 1.2345678901234567, 1e308]", { indent: "2" });
    if (r.ok) expect(r.warnings).toHaveLength(0);
  });

  it("warns for numbers that overflow to Infinity", () => {
    const r = processJson("[1e400000000000000]", { indent: "2" });
    if (r.ok) expect(r.warnings[0].code).toBe("unsafe-number");
  });
});

describe("tree contents", () => {
  it("decodes escaped strings and keeps raw literals", () => {
    const r = parseJson('{"k\\u0065y": "a\\nb", "n": 1.50}');
    expect(r.ok).toBe(true);
    if (r.ok && r.node.kind === "object") {
      expect(r.node.entries[0].key).toBe("key");
      expect(r.node.entries[0].rawKey).toBe('"k\\u0065y"');
      const v = r.node.entries[0].value;
      expect(v.kind === "string" && v.value).toBe("a\nb");
      const n = r.node.entries[1].value;
      expect(n.kind === "number" && n.raw).toBe("1.50");
    }
  });

  it("round-trips through stringifyNode losslessly", () => {
    const input = '{"a":[1,2.50,-0,1E+2,"\\u00e9"],"b":{"c":null,"d":true}}';
    const r = parseJson(input);
    if (r.ok) expect(stringifyNode(r.node, { indent: "minify" })).toBe(input);
  });
});
