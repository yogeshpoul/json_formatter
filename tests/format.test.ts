import { describe, expect, it } from "vitest";
import { processJson } from "@/lib/json";

function format(input: string, indent: "2" | "4" | "tab" | "minify", sortKeys = false) {
  const r = processJson(input, { indent, sortKeys });
  if (!r.ok) throw new Error(r.error.message);
  return r;
}

const SAMPLE = {
  name: "Ada",
  tags: ["math", "code"],
  nested: { deep: { deeper: [1, { x: null }] }, empty: {}, list: [] },
  active: true,
  score: -12.5,
};

describe("pretty printing", () => {
  it.each([
    ["2", 2],
    ["4", 4],
    ["tab", "\t"],
  ] as const)("matches JSON.stringify with indent %s", (indent, native) => {
    const input = JSON.stringify(SAMPLE);
    expect(format(input, indent).output).toBe(JSON.stringify(SAMPLE, null, native));
  });

  it("formats arrays at the root", () => {
    expect(format("[1,[2,3],[]]", "2").output).toBe("[\n  1,\n  [\n    2,\n    3\n  ],\n  []\n]");
  });

  it("formats scalars at the root", () => {
    expect(format(' "x" ', "2").output).toBe('"x"');
    expect(format("42", "4").output).toBe("42");
  });

  it("keeps empty objects and arrays compact", () => {
    expect(format('{"a":{},"b":[]}', "2").output).toBe('{\n  "a": {},\n  "b": []\n}');
  });

  it("never changes string escapes or number literals", () => {
    const out = format('{"s":"caf\\u00e9 \\/","n":1.0e+2}', "2").output;
    expect(out).toContain('"caf\\u00e9 \\/"');
    expect(out).toContain("1.0e+2");
  });
});

describe("minification", () => {
  it("removes all insignificant whitespace", () => {
    const input = JSON.stringify(SAMPLE, null, 4);
    expect(format(input, "minify").output).toBe(JSON.stringify(SAMPLE));
  });

  it("preserves whitespace inside strings", () => {
    expect(format('{ "a" : "  spaced  out  " }', "minify").output).toBe('{"a":"  spaced  out  "}');
  });

  it("reports smaller output size", () => {
    const r = format(JSON.stringify(SAMPLE, null, 2), "minify");
    expect(r.stats.outputBytes!).toBeLessThan(r.stats.inputBytes);
  });
});

describe("key sorting", () => {
  it("sorts keys recursively without reordering arrays", () => {
    const out = format('{"b":1,"a":{"z":1,"y":2},"c":[3,1,2]}', "minify", true).output;
    expect(out).toBe('{"a":{"y":2,"z":1},"b":1,"c":[3,1,2]}');
  });

  it("sorts objects inside arrays", () => {
    expect(format('[{"b":1,"a":2}]', "minify", true).output).toBe('[{"a":2,"b":1}]');
  });

  it("uses code-unit order like Array.prototype.sort", () => {
    const keys = ["b", "B", "a", "_", "10", "9", "é"];
    const input = JSON.stringify(Object.fromEntries(keys.map((k) => [k, 0])));
    const out = format(input, "minify", true).output;
    const expected = [...keys].sort();
    // Note: JSON.parse would reorder integer-like keys, so compare key order textually.
    const order = [...out.matchAll(/"([^"]+)":/g)].map((m) => m[1]);
    expect(order).toEqual(expected);
  });
});

describe("stats", () => {
  it("describes the document", () => {
    const r = format(JSON.stringify(SAMPLE), "2");
    expect(r.stats.rootType).toBe("object");
    expect(r.stats.topLevelCount).toBe(5);
    expect(r.stats.maxDepth).toBe(5);
    expect(r.stats.nulls).toBe(1);
    expect(r.stats.booleans).toBe(1);
    expect(r.stats.arrays).toBe(3);
  });

  it("describes arrays", () => {
    const r = format("[1,2,3]", "2");
    expect(r.stats.rootType).toBe("array");
    expect(r.stats.topLevelCount).toBe(3);
  });
});

describe("invalid and empty input", () => {
  it("flags empty input separately", () => {
    const r = processJson("", { indent: "2" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.empty).toBe(true);
  });

  it("returns errors instead of throwing", () => {
    const r = processJson('{"a":', { indent: "2" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.empty).toBe(false);
  });
});

describe("large documents", () => {
  it("formats a ~5 MB document correctly and quickly", () => {
    const items = Array.from({ length: 40_000 }, (_, i) => ({
      id: i,
      name: `item-${i}`,
      price: i * 1.25,
      tags: ["a", "b", "c"],
      meta: { active: i % 2 === 0, note: null },
    }));
    const input = JSON.stringify(items);
    expect(input.length).toBeGreaterThan(4_000_000);
    const start = performance.now();
    const r = format(input, "2");
    const elapsed = performance.now() - start;
    expect(r.output).toBe(JSON.stringify(items, null, 2));
    expect(r.stats.topLevelCount).toBe(40_000);
    expect(elapsed).toBeLessThan(5000);
  });
});
