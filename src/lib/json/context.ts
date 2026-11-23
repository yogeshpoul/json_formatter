export interface ContextLine {
  number: number;
  text: string;
  isErrorLine: boolean;
}

const MAX_LINE_LENGTH = 160;

/**
 * Returns a few lines around an error for display, plus the caret column
 * adjusted for any truncation of very long lines (e.g. minified JSON).
 */
export function getErrorContext(
  input: string,
  line: number,
  column: number,
  radius = 2,
): { lines: ContextLine[]; caretColumn: number } {
  const all = input.split("\n");
  const from = Math.max(1, line - radius);
  const to = Math.min(all.length, line + 1);
  let caretColumn = column;
  const lines: ContextLine[] = [];
  for (let n = from; n <= to; n++) {
    let text = (all[n - 1] ?? "").replace(/\r$/, "");
    if (text.length > MAX_LINE_LENGTH) {
      if (n === line) {
        const start = Math.max(0, column - 1 - Math.floor(MAX_LINE_LENGTH / 2));
        const prefix = start > 0 ? "…" : "";
        text = prefix + text.slice(start, start + MAX_LINE_LENGTH) + (start + MAX_LINE_LENGTH < text.length ? "…" : "");
        caretColumn = column - start + prefix.length;
      } else {
        text = text.slice(0, MAX_LINE_LENGTH) + "…";
      }
    }
    lines.push({ number: n, text, isErrorLine: n === line });
  }
  return { lines, caretColumn };
}
