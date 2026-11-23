import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  diffJson,
  escapeJsonString,
  jsonToCsv,
  jsonToXml,
  parseJson,
  processJson,
  unescapeJsonString,
} from "@/lib/json";

const SECRET = '{"apiKey":"sk_live_SECRET_123","user":{"email":"private@example.com"},"items":[1,2,3]}';

describe("runtime: JSON processing never touches the network or storage", () => {
  const calls: string[] = [];
  const trap = (name: string) =>
    vi.fn((...args: unknown[]) => {
      calls.push(`${name}(${JSON.stringify(args).slice(0, 80)})`);
      throw new Error(`${name} must not be called`);
    });

  beforeEach(() => {
    calls.length = 0;
    vi.stubGlobal("fetch", trap("fetch"));
    vi.stubGlobal("XMLHttpRequest", trap("XMLHttpRequest"));
    vi.stubGlobal("WebSocket", trap("WebSocket"));
    vi.stubGlobal("EventSource", trap("EventSource"));
    vi.stubGlobal("navigator", { sendBeacon: trap("sendBeacon") });
    const storage = { getItem: trap("storage.getItem"), setItem: trap("storage.setItem") };
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("sessionStorage", storage);
    vi.stubGlobal("indexedDB", { open: trap("indexedDB.open") });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("formats, validates, converts, escapes and diffs without any I/O", () => {
    for (const indent of ["2", "4", "tab", "minify"] as const) {
      expect(processJson(SECRET, { indent, sortKeys: true }).ok).toBe(true);
    }
    expect(processJson('{"broken": ', { indent: "2" }).ok).toBe(false);

    const parsed = parseJson(SECRET);
    if (!parsed.ok) throw new Error("sample should parse");
    jsonToCsv(parsed.node, { delimiter: ",", flatten: true, includeHeader: true });
    jsonToXml(parsed.node, { rootName: "root", itemName: "item", indent: "2", declaration: true });
    diffJson(parsed.node, parsed.node);
    unescapeJsonString(escapeJsonString(SECRET, true));

    expect(calls).toEqual([]);
  });
});

describe("static: source code contains no network calls or JSON persistence", () => {
  const SRC = join(__dirname, "..", "src");

  function listFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const full = join(dir, name);
      return statSync(full).isDirectory() ? listFiles(full) : /\.(ts|tsx)$/.test(name) ? [full] : [];
    });
  }

  const files = listFiles(SRC).map((file) => ({
    path: relative(SRC, file).split(sep).join("/"),
    source: readFileSync(file, "utf8"),
  }));

  const NETWORK = /\b(fetch\s*\(|XMLHttpRequest|sendBeacon|new\s+WebSocket|EventSource|navigator\.connection)\b/;
  // Matches API access (e.g. `localStorage.setItem`), not prose that mentions the word.
  const STORAGE = /\b(localStorage|sessionStorage|indexedDB)\s*(\.[A-Za-z]|\[)|\bdocument\.cookie\b|\bcookieStore\b/;
  const SERVER_FEATURES = /^\s*["']use server["']|from\s+["']next\/server["']/m;

  // The theme toggle stores only "light" or "dark". No other file may use storage.
  const STORAGE_ALLOWLIST = new Set(["components/layout/ThemeToggle.tsx"]);

  it("scans a meaningful number of files", () => {
    expect(files.length).toBeGreaterThan(30);
  });

  it.each(files.map((f) => [f.path, f.source]))("%s makes no network requests", (_path, source) => {
    expect(source).not.toMatch(NETWORK);
  });

  it.each(files.map((f) => [f.path, f.source]))("%s does not persist data", (path, source) => {
    if (STORAGE_ALLOWLIST.has(path)) return;
    expect(source).not.toMatch(STORAGE);
  });

  it.each(files.map((f) => [f.path, f.source]))("%s uses no server actions or server APIs", (_path, source) => {
    expect(source).not.toMatch(SERVER_FEATURES);
  });

  it("has no API route handlers", () => {
    expect(files.filter((f) => /(^|\/)route\.(ts|tsx)$/.test(f.path))).toEqual([]);
  });

  it("theme storage only ever writes the theme preference", () => {
    const theme = files.find((f) => f.path === "components/layout/ThemeToggle.tsx")!;
    const writes = [...theme.source.matchAll(/localStorage\.setItem\(([^)]*)\)/g)].map((m) => m[1]);
    expect(writes).toEqual(['STORAGE_KEY, next ? "dark" : "light"']);
  });

  it("the static export config is enabled", () => {
    const config = readFileSync(join(__dirname, "..", "next.config.ts"), "utf8");
    expect(config).toMatch(/output:\s*"export"/);
  });
});
