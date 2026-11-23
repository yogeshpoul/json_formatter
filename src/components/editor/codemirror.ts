import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { json } from "@codemirror/lang-json";
import {
  bracketMatching,
  foldAll,
  foldGutter,
  foldKeymap,
  HighlightStyle,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
  unfoldAll,
} from "@codemirror/language";
import { highlightSelectionMatches, search, searchKeymap } from "@codemirror/search";
import { EditorSelection, EditorState, StateEffect, StateField, type Extension } from "@codemirror/state";
import {
  Decoration,
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  placeholder as placeholderExtension,
  type DecorationSet,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";

export type EditorLanguage = "json" | "text";

export interface EditorOptions {
  doc: string;
  readOnly: boolean;
  language: EditorLanguage;
  ariaLabel: string;
  placeholder?: string;
  lineWrapping?: boolean;
  onChange?: (value: string) => void;
}

export interface EditorApi {
  setDoc(value: string): void;
  setError(position: number | null): void;
  goTo(position: number): void;
  focus(): void;
  foldAll(): void;
  unfoldAll(): void;
  destroy(): void;
}

// Colors come from CSS variables, so light/dark themes switch instantly
// without reconfiguring the editor.
const highlightStyle = HighlightStyle.define([
  { tag: tags.propertyName, color: "var(--syn-key)" },
  { tag: tags.string, color: "var(--syn-string)" },
  { tag: tags.number, color: "var(--syn-number)" },
  { tag: [tags.bool, tags.null], color: "var(--syn-literal)", fontWeight: "600" },
  { tag: [tags.separator, tags.brace, tags.squareBracket, tags.punctuation], color: "var(--syn-punct)" },
]);

const theme = EditorView.theme({
  "&": { backgroundColor: "var(--surface)", color: "var(--text)" },
  ".cm-content": { caretColor: "var(--text)", padding: "8px 0" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--text)" },
  ".cm-gutters": {
    backgroundColor: "var(--editor-gutter)",
    color: "var(--text-subtle)",
    borderRight: "1px solid var(--border)",
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 12px", minWidth: "36px" },
  ".cm-activeLine": { backgroundColor: "var(--editor-active-line)" },
  ".cm-activeLineGutter": { backgroundColor: "var(--editor-active-line)", color: "var(--text)" },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    { backgroundColor: "var(--editor-selection)" },
  ".cm-selectionMatch": { backgroundColor: "var(--editor-selection)" },
  "&.cm-focused .cm-matchingBracket": { backgroundColor: "var(--accent-soft)", outline: "1px solid var(--accent)" },
  ".cm-placeholder": { color: "var(--text-subtle)" },
  ".cm-foldPlaceholder": {
    backgroundColor: "var(--accent-soft)",
    border: "1px solid var(--border)",
    color: "var(--accent-text)",
    padding: "0 6px",
    borderRadius: "4px",
  },
  ".cm-foldGutter .cm-gutterElement": { padding: "0 4px", cursor: "pointer" },
  ".cm-json-error-line": { backgroundColor: "var(--editor-error)" },
  ".cm-json-error": {
    textDecoration: "underline wavy var(--danger)",
    textUnderlineOffset: "3px",
    backgroundColor: "var(--editor-error)",
  },
  ".cm-panels": { backgroundColor: "var(--surface-2)", color: "var(--text)" },
  ".cm-panels.cm-panels-top": { borderBottom: "1px solid var(--border)" },
  ".cm-search input, .cm-search button": { fontSize: "12px" },
  ".cm-textfield": {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border-strong)",
    borderRadius: "4px",
    color: "var(--text)",
  },
  ".cm-button": {
    backgroundImage: "none",
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border-strong)",
    borderRadius: "4px",
    color: "var(--text)",
  },
  ".cm-searchMatch": { backgroundColor: "rgba(250, 204, 21, 0.35)" },
  ".cm-searchMatch-selected": { backgroundColor: "rgba(250, 204, 21, 0.7)" },
});

const setErrorEffect = StateEffect.define<number | null>();

const errorField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decorations, tr) {
    let next = decorations.map(tr.changes);
    for (const effect of tr.effects) {
      if (!effect.is(setErrorEffect)) continue;
      if (effect.value === null) {
        next = Decoration.none;
        continue;
      }
      const pos = Math.min(Math.max(effect.value, 0), tr.state.doc.length);
      const line = tr.state.doc.lineAt(pos);
      const ranges = [Decoration.line({ class: "cm-json-error-line" }).range(line.from)];
      if (pos < line.to) ranges.push(Decoration.mark({ class: "cm-json-error" }).range(pos, pos + 1));
      next = Decoration.set(ranges, true);
    }
    return next;
  },
  provide: (field) => EditorView.decorations.from(field),
});

export function createEditor(parent: HTMLElement, options: EditorOptions): EditorApi {
  let lastEmitted: string | null = null;
  let applyingExternal = false;

  const extensions: Extension[] = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    foldGutter({ openText: "▾", closedText: "▸" }),
    drawSelection(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    bracketMatching(),
    search({ top: true }),
    syntaxHighlighting(highlightStyle),
    indentUnit.of("  "),
    EditorState.tabSize.of(4),
    theme,
    errorField,
    keymap.of([...searchKeymap, ...foldKeymap, ...defaultKeymap, ...(options.readOnly ? [] : historyKeymap)]),
    EditorView.contentAttributes.of({
      "aria-label": options.ariaLabel,
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      translate: "no",
    }),
  ];

  if (options.language === "json") extensions.push(json());
  if (options.lineWrapping) extensions.push(EditorView.lineWrapping);
  if (options.placeholder) extensions.push(placeholderExtension(options.placeholder));

  if (options.readOnly) {
    extensions.push(EditorState.readOnly.of(true), EditorView.contentAttributes.of({ "aria-readonly": "true" }));
  } else {
    extensions.push(history(), indentOnInput(), keymap.of([indentWithTab]));
  }

  if (options.onChange) {
    const onChange = options.onChange;
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (!update.docChanged || applyingExternal) return;
        const value = update.state.doc.toString();
        lastEmitted = value;
        onChange(value);
      }),
    );
  }

  const view = new EditorView({
    parent,
    state: EditorState.create({ doc: options.doc, extensions }),
  });
  lastEmitted = options.doc;

  return {
    setDoc(value) {
      if (value === lastEmitted) return;
      if (value === view.state.doc.toString()) {
        lastEmitted = value;
        return;
      }
      applyingExternal = true;
      try {
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
      } finally {
        applyingExternal = false;
      }
      lastEmitted = value;
    },
    setError(position) {
      view.dispatch({ effects: setErrorEffect.of(position) });
    },
    goTo(position) {
      const pos = Math.min(Math.max(position, 0), view.state.doc.length);
      view.dispatch({
        selection: EditorSelection.cursor(pos),
        effects: EditorView.scrollIntoView(pos, { y: "center" }),
      });
      view.focus();
    },
    focus() {
      view.focus();
    },
    foldAll() {
      foldAll(view);
    },
    unfoldAll() {
      unfoldAll(view);
    },
    destroy() {
      view.destroy();
    },
  };
}
