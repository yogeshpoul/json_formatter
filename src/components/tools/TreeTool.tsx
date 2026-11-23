"use client";

import { ChevronRight, ChevronsDownUp, ChevronsUpDown, Copy, Search } from "lucide-react";
import { createContext, use, useDeferredValue, useId, useMemo, useRef, useState } from "react";
import type { CodeEditorHandle } from "@/components/editor/CodeEditor";
import { Button } from "@/components/ui/Button";
import { sampleJson } from "@/content/samples";
import { useCopy } from "@/hooks/useCopy";
import { useParsedJson } from "@/hooks/useParsedJson";
import { appendIndex, appendKey, ROOT_PATH } from "@/lib/json/path";
import type { JsonNode } from "@/lib/json/types";
import { InputPanel } from "./InputPanel";
import { EmptyState, ErrorState } from "./OutputPanel";
import { Panel } from "./Panel";
import { StatusBar } from "./StatusBar";

const PAGE_SIZE = 100;
const MAX_MATCHES = 2000;

interface TreeContextValue {
  expandDepth: number;
  /** Paths of nodes that must be open because they contain search matches. */
  ancestors: Set<string> | null;
  matches: Set<string> | null;
  copyPath: (path: string) => void;
}

const TreeContext = createContext<TreeContextValue | null>(null);

interface SearchResult {
  matches: Set<string>;
  ancestors: Set<string>;
  truncated: boolean;
}

function searchTree(root: JsonNode, query: string): SearchResult {
  const q = query.toLowerCase();
  const matches = new Set<string>();
  const ancestors = new Set<string>();
  let truncated = false;

  // Iterative DFS carrying the ancestor chain for each node.
  const stack: { node: JsonNode; path: string; key: string | null; chain: string[] }[] = [
    { node: root, path: ROOT_PATH, key: null, chain: [] },
  ];
  while (stack.length > 0) {
    const { node, path, key, chain } = stack.pop()!;
    const keyHit = key !== null && key.toLowerCase().includes(q);
    const valueText =
      node.kind === "string"
        ? node.value
        : node.kind === "number"
          ? node.raw
          : node.kind === "boolean"
            ? String(node.value)
            : node.kind === "null"
              ? "null"
              : null;
    const valueHit = valueText !== null && valueText.toLowerCase().includes(q);
    if (keyHit || valueHit) {
      if (matches.size >= MAX_MATCHES) {
        truncated = true;
        break;
      }
      matches.add(path);
      for (const a of chain) ancestors.add(a);
    }
    const nextChain = node.kind === "object" || node.kind === "array" ? [...chain, path] : chain;
    if (node.kind === "object") {
      for (let i = node.entries.length - 1; i >= 0; i--) {
        const e = node.entries[i];
        stack.push({ node: e.value, path: appendKey(path, e.key), key: e.key, chain: nextChain });
      }
    } else if (node.kind === "array") {
      for (let i = node.items.length - 1; i >= 0; i--) {
        stack.push({ node: node.items[i], path: appendIndex(path, i), key: null, chain: nextChain });
      }
    }
  }
  return { matches, ancestors, truncated };
}

function ScalarValue({ node }: { node: JsonNode }) {
  switch (node.kind) {
    case "string": {
      const text = node.raw.length > 300 ? `${node.raw.slice(0, 300)}…"` : node.raw;
      return <span className="break-all text-syn-string">{text}</span>;
    }
    case "number":
      return <span className="text-syn-number">{node.raw}</span>;
    case "boolean":
      return <span className="font-semibold text-syn-literal">{String(node.value)}</span>;
    case "null":
      return <span className="font-semibold text-syn-literal">null</span>;
    default:
      return null;
  }
}

function summary(node: JsonNode): string {
  if (node.kind === "object") return `{ ${node.entries.length} ${node.entries.length === 1 ? "key" : "keys"} }`;
  if (node.kind === "array") return `[ ${node.items.length} ${node.items.length === 1 ? "item" : "items"} ]`;
  return "";
}

interface TreeNodeProps {
  node: JsonNode;
  label: string | number | null;
  path: string;
  depth: number;
}

function TreeNode({ node, label, path, depth }: TreeNodeProps) {
  const ctx = use(TreeContext)!;
  const isContainer = node.kind === "object" || node.kind === "array";
  const [open, setOpen] = useState(depth < ctx.expandDepth);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const forced = ctx.ancestors?.has(path) ?? false;
  const isOpen = isContainer && (open || forced);
  const isMatch = ctx.matches?.has(path) ?? false;

  const children: { key: string; label: string | number; node: JsonNode; path: string }[] = [];
  let total = 0;
  if (isOpen) {
    if (node.kind === "object") {
      total = node.entries.length;
      node.entries.forEach((e, i) => children.push({ key: `${i}`, label: e.key, node: e.value, path: appendKey(path, e.key) }));
    } else if (node.kind === "array") {
      total = node.items.length;
      node.items.forEach((item, i) => children.push({ key: `${i}`, label: i, node: item, path: appendIndex(path, i) }));
    }
  }
  // While searching, show only branches that contain matches.
  const filtered =
    ctx.matches && forced && !isMatch
      ? children.filter((c) => ctx.matches!.has(c.path) || ctx.ancestors!.has(c.path))
      : children;
  const visible = filtered.slice(0, limit);

  const labelEl =
    label === null ? (
      <span className="font-semibold text-muted">root</span>
    ) : typeof label === "number" ? (
      <span className="text-subtle">{label}</span>
    ) : (
      <span className="text-syn-key">{JSON.stringify(label)}</span>
    );

  return (
    <li className="min-w-0">
      <div
        className={`group flex min-h-7 items-start gap-1 rounded px-1 font-mono text-[13px] leading-7 hover:bg-surface-2 ${isMatch ? "bg-warning-soft" : ""}`}
      >
        {isContainer ? (
          <button
            type="button"
            aria-expanded={isOpen}
            onClick={() => setOpen(!isOpen)}
            className="flex min-w-0 items-start gap-1 rounded text-left"
          >
            <ChevronRight
              size={14}
              aria-hidden
              className={`mt-[7px] shrink-0 text-subtle transition-transform ${isOpen ? "rotate-90" : ""}`}
            />
            <span className="break-all">
              {labelEl}
              <span className="text-syn-punct">{label === null ? " " : ": "}</span>
              <span className="text-subtle">{summary(node)}</span>
            </span>
          </button>
        ) : (
          <span className="min-w-0 pl-[18px] break-all">
            {labelEl}
            <span className="text-syn-punct">: </span>
            <ScalarValue node={node} />
          </span>
        )}
        <button
          type="button"
          onClick={() => ctx.copyPath(path)}
          aria-label={`Copy path ${path}`}
          title={`Copy path ${path}`}
          className="ml-auto mt-1 shrink-0 rounded p-1 text-subtle opacity-0 group-hover:opacity-100 hover:text-fg focus-visible:opacity-100"
        >
          <Copy size={13} aria-hidden />
        </button>
      </div>
      {isOpen && (
        <ul className="ml-[11px] border-l border-border pl-2">
          {visible.map((c) => (
            <TreeNode key={c.key} node={c.node} label={c.label} path={c.path} depth={depth + 1} />
          ))}
          {filtered.length > limit && (
            <li className="py-1 pl-[18px]">
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE_SIZE)}
                className="text-[13px] font-medium text-accent-text underline underline-offset-2"
              >
                Show {Math.min(PAGE_SIZE, filtered.length - limit)} more of {(filtered.length - limit).toLocaleString()} remaining
              </button>
            </li>
          )}
          {total === 0 && <li className="pl-[18px] font-mono text-[13px] text-subtle">empty</li>}
        </ul>
      )}
    </li>
  );
}

export function TreeTool() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [expandDepth, setExpandDepth] = useState(2);
  const [generation, setGeneration] = useState(0);
  const deferredQuery = useDeferredValue(query.trim());
  const parsed = useParsedJson(input);
  const inputEditor = useRef<CodeEditorHandle>(null);
  const searchId = useId();
  const { copy } = useCopy();
  const [copied, setCopied] = useState("");

  const search = useMemo(() => {
    if (!parsed?.ok || deferredQuery === "") return null;
    return searchTree(parsed.node, deferredQuery);
  }, [parsed, deferredQuery]);

  const ctx = useMemo<TreeContextValue>(
    () => ({
      expandDepth,
      ancestors: search?.ancestors ?? null,
      matches: search?.matches ?? null,
      copyPath: (path) => {
        void copy(path);
        setCopied(path);
      },
    }),
    [expandDepth, search, copy],
  );

  const setAll = (depth: number) => {
    setExpandDepth(depth);
    setGeneration((g) => g + 1);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <InputPanel
          title="JSON input"
          value={input}
          onChange={setInput}
          sample={sampleJson}
          errorPosition={parsed && !parsed.ok ? parsed.error.position : null}
          editorRef={inputEditor}
        />
        <Panel
          title="Tree"
          titleId={`${searchId}-title`}
          actions={
            <>
              <Button size="sm" variant="ghost" icon={<ChevronsUpDown size={15} aria-hidden />} onClick={() => setAll(Infinity)} disabled={!parsed?.ok}>
                Expand all
              </Button>
              <Button size="sm" variant="ghost" icon={<ChevronsDownUp size={15} aria-hidden />} onClick={() => setAll(1)} disabled={!parsed?.ok}>
                Collapse all
              </Button>
            </>
          }
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search size={15} className="shrink-0 text-subtle" aria-hidden />
            <label htmlFor={searchId} className="sr-only">
              Search keys and values
            </label>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keys and values…"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-subtle"
            />
            <span className="shrink-0 text-xs text-muted" aria-live="polite">
              {search
                ? `${search.matches.size.toLocaleString()}${search.truncated ? "+" : ""} ${search.matches.size === 1 ? "match" : "matches"}`
                : ""}
            </span>
          </div>
          <div className="h-[336px] overflow-auto p-2 md:h-[476px]">
            {!parsed ? (
              <EmptyState>Paste JSON on the left to explore it as an interactive tree.</EmptyState>
            ) : !parsed.ok ? (
              <ErrorState title="Invalid JSON" message={`${parsed.error.message} (line ${parsed.error.line}, column ${parsed.error.column}).`} />
            ) : search && search.matches.size === 0 ? (
              <EmptyState>No keys or values match “{deferredQuery}”.</EmptyState>
            ) : (
              <TreeContext value={ctx}>
                <ul key={generation} aria-label="JSON tree">
                  <TreeNode node={parsed.node} label={null} path={ROOT_PATH} depth={0} />
                </ul>
              </TreeContext>
            )}
          </div>
          <p className="border-t border-border px-3 py-1.5 font-mono text-xs text-muted empty:hidden" aria-live="polite">
            {copied ? `Copied ${copied}` : ""}
          </p>
        </Panel>
      </div>
      <StatusBar
        state={!parsed ? { kind: "empty" } : parsed.ok ? { kind: "valid", warnings: parsed.warnings.length } : { kind: "invalid", error: parsed.error }}
        onGoTo={(pos) => inputEditor.current?.goTo(pos)}
      />
    </div>
  );
}
