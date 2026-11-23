import { parseJson } from "./parser";

export type UnescapeResult = { ok: true; value: string } | { ok: false; error: string };

/**
 * Escapes text so it can be embedded as a JSON string value.
 * Uses the native `JSON.stringify`.
 */
export function escapeJsonString(text: string, wrapInQuotes: boolean): string {
  const literal = JSON.stringify(text);
  return wrapInQuotes ? literal : literal.slice(1, -1);
}

/**
 * Turns an escaped JSON string back into plain text. Accepts input with or
 * without surrounding double quotes. Real line breaks and tabs in the input
 * are tolerated because they commonly appear when copying from logs.
 */
export function unescapeJsonString(text: string): UnescapeResult {
  const quoted = text.length >= 2 && text.startsWith('"') && text.endsWith('"') ? text : `"${text}"`;
  const literal = quoted.replace(/\r\n|\n|\r|\t/g, (m) => (m === "\t" ? "\\t" : "\\n"));
  try {
    return { ok: true, value: JSON.parse(literal) as string };
  } catch {
    const parsed = parseJson(literal);
    if (!parsed.ok) {
      const message = parsed.error.message.startsWith("Unexpected data after")
        ? 'The text contains an unescaped double quote ("). Escape it as \\"'
        : parsed.error.message;
      return { ok: false, error: message };
    }
    return { ok: false, error: "The text is not a valid escaped JSON string" };
  }
}
