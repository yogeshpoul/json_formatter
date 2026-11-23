import type {
  JsonEntry,
  JsonErrorInfo,
  JsonNode,
  JsonWarning,
  JsonWarningCode,
  ParseResult,
} from "./types";

/**
 * Strict RFC 8259 JSON parser that produces a lossless syntax tree.
 *
 * Why not only `JSON.parse`?
 *  - Error messages and positions differ between browsers (Safari reports no
 *    position at all). This parser reports consistent line/column details.
 *  - `JSON.parse` silently rounds large integers and drops duplicate keys.
 *    This parser keeps literals verbatim and reports such cases as warnings,
 *    so formatting never silently changes a value.
 *
 * Escaped strings are still decoded with the native `JSON.parse`.
 */

const MAX_WARNINGS = 50;

const enum Ch {
  Tab = 0x09,
  LineFeed = 0x0a,
  CarriageReturn = 0x0d,
  Space = 0x20,
  Quote = 0x22,
  Plus = 0x2b,
  Comma = 0x2c,
  Minus = 0x2d,
  Dot = 0x2e,
  Slash = 0x2f,
  Zero = 0x30,
  Nine = 0x39,
  Colon = 0x3a,
  UpperE = 0x45,
  OpenBracket = 0x5b,
  Backslash = 0x5c,
  CloseBracket = 0x5d,
  LowerE = 0x65,
  LowerU = 0x75,
  OpenBrace = 0x7b,
  CloseBrace = 0x7d,
}

class ParseFailure {
  constructor(
    readonly message: string,
    readonly position: number,
  ) {}
}

interface PendingWarning {
  code: JsonWarningCode;
  message: string;
  position: number;
}

function isDigit(c: number): boolean {
  return c >= Ch.Zero && c <= Ch.Nine;
}

function isHex(c: number): boolean {
  return (c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x46) || (c >= 0x61 && c <= 0x66);
}

function isIdentStart(c: number): boolean {
  return (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || c === 0x5f || c === 0x24;
}

function describeChar(ch: string): string {
  const code = ch.charCodeAt(0);
  if (code < 0x20 || code === 0x7f) return `\\u${code.toString(16).padStart(4, "0")}`;
  return ch;
}

class Parser {
  private pos = 0;
  readonly warnings: PendingWarning[] = [];

  constructor(private readonly src: string) {}

  parse(): JsonNode {
    if (this.src.charCodeAt(0) === 0xfeff) {
      throw new ParseFailure("Byte order mark (BOM) at the start of the input is not allowed in JSON", 0);
    }
    const node = this.parseValue();
    this.skipWhitespace();
    if (this.pos < this.src.length) {
      throw new ParseFailure(
        "Unexpected data after the end of the JSON value. Multiple top-level values must be wrapped in an array",
        this.pos,
      );
    }
    return node;
  }

  get position(): number {
    return this.pos;
  }

  private warn(code: JsonWarningCode, message: string, position: number) {
    if (this.warnings.length < MAX_WARNINGS) this.warnings.push({ code, message, position });
  }

  private skipWhitespace() {
    const src = this.src;
    let pos = this.pos;
    while (pos < src.length) {
      const c = src.charCodeAt(pos);
      if (c === Ch.Space || c === Ch.LineFeed || c === Ch.CarriageReturn || c === Ch.Tab) pos++;
      else break;
    }
    this.pos = pos;
  }

  private readWord(): string {
    const src = this.src;
    let end = this.pos;
    while (end < src.length && end - this.pos < 24) {
      const c = src.charCodeAt(end);
      if (isIdentStart(c) || isDigit(c)) end++;
      else break;
    }
    return src.slice(this.pos, end);
  }

  private unexpected(context: "value" | "key"): never {
    const ch = this.src[this.pos];
    const c = ch.charCodeAt(0);
    if (c === 0x27) {
      throw new ParseFailure(
        context === "key"
          ? "Property names must be wrapped in double quotes, not single quotes"
          : "Strings must be wrapped in double quotes, not single quotes",
        this.pos,
      );
    }
    if (c === Ch.Slash) {
      throw new ParseFailure("Comments are not allowed in JSON", this.pos);
    }
    if (isIdentStart(c)) {
      const word = this.readWord();
      if (context === "key") {
        throw new ParseFailure(`Property name "${word}" must be wrapped in double quotes`, this.pos);
      }
      if (word === "undefined" || word === "NaN" || word === "Infinity") {
        throw new ParseFailure(`"${word}" is not a valid JSON value`, this.pos);
      }
      if (word === "True" || word === "False" || word === "None" || word === "Null" || word === "NULL") {
        throw new ParseFailure(
          `"${word}" is not valid JSON. Use lowercase true, false or null`,
          this.pos,
        );
      }
      throw new ParseFailure(`Unexpected token "${word}". Text values must be wrapped in double quotes`, this.pos);
    }
    if (context === "key") {
      throw new ParseFailure(`Expected a property name in double quotes but found "${describeChar(ch)}"`, this.pos);
    }
    throw new ParseFailure(`Unexpected character "${describeChar(ch)}". Expected a JSON value`, this.pos);
  }

  private parseValue(): JsonNode {
    this.skipWhitespace();
    if (this.pos >= this.src.length) {
      throw new ParseFailure("Unexpected end of input. Expected a JSON value", this.pos);
    }
    const c = this.src.charCodeAt(this.pos);
    switch (c) {
      case Ch.OpenBrace:
        return this.parseObject();
      case Ch.OpenBracket:
        return this.parseArray();
      case Ch.Quote: {
        const { raw, value } = this.parseString();
        return { kind: "string", raw, value };
      }
      case 0x74: // t
        return this.parseLiteral("true", { kind: "boolean", value: true });
      case 0x66: // f
        return this.parseLiteral("false", { kind: "boolean", value: false });
      case 0x6e: // n
        return this.parseLiteral("null", { kind: "null" });
      default:
        if (c === Ch.Minus || isDigit(c)) return this.parseNumber();
        return this.unexpected("value");
    }
  }

  private parseLiteral<T extends JsonNode>(word: string, node: T): T {
    if (this.src.startsWith(word, this.pos)) {
      this.pos += word.length;
      return node;
    }
    return this.unexpected("value");
  }

  private parseObject(): JsonNode {
    const src = this.src;
    this.pos++; // {
    const entries: JsonEntry[] = [];
    this.skipWhitespace();
    if (src.charCodeAt(this.pos) === Ch.CloseBrace) {
      this.pos++;
      return { kind: "object", entries };
    }
    const seen = new Set<string>();
    for (;;) {
      this.skipWhitespace();
      if (this.pos >= src.length) {
        throw new ParseFailure("Unexpected end of input. Expected a property name or '}'", this.pos);
      }
      const c = src.charCodeAt(this.pos);
      if (c !== Ch.Quote) {
        if (c === Ch.CloseBrace && entries.length > 0) {
          throw new ParseFailure("Trailing comma before '}' is not allowed in JSON", this.pos);
        }
        this.unexpected("key");
      }
      const keyPos = this.pos;
      const { raw: rawKey, value: key } = this.parseString();
      if (seen.has(key)) {
        this.warn(
          "duplicate-key",
          `Duplicate key "${key}". Most parsers keep only the last value; this tool keeps both`,
          keyPos,
        );
      } else {
        seen.add(key);
      }
      this.skipWhitespace();
      if (this.pos >= src.length) {
        throw new ParseFailure("Unexpected end of input. Expected ':' after property name", this.pos);
      }
      if (src.charCodeAt(this.pos) !== Ch.Colon) {
        throw new ParseFailure(`Expected ':' after property name "${key}"`, this.pos);
      }
      this.pos++;
      const value = this.parseValue();
      entries.push({ key, rawKey, value });
      this.skipWhitespace();
      if (this.pos >= src.length) {
        throw new ParseFailure("Unexpected end of input. Expected ',' or '}'", this.pos);
      }
      const next = src.charCodeAt(this.pos);
      if (next === Ch.Comma) {
        this.pos++;
        continue;
      }
      if (next === Ch.CloseBrace) {
        this.pos++;
        return { kind: "object", entries };
      }
      if (next === Ch.Quote) {
        throw new ParseFailure("Expected ',' or '}' after property value. Is a comma missing?", this.pos);
      }
      throw new ParseFailure("Expected ',' or '}' after property value", this.pos);
    }
  }

  private parseArray(): JsonNode {
    const src = this.src;
    this.pos++; // [
    const items: JsonNode[] = [];
    this.skipWhitespace();
    if (src.charCodeAt(this.pos) === Ch.CloseBracket) {
      this.pos++;
      return { kind: "array", items };
    }
    for (;;) {
      this.skipWhitespace();
      if (src.charCodeAt(this.pos) === Ch.CloseBracket && items.length > 0) {
        throw new ParseFailure("Trailing comma before ']' is not allowed in JSON", this.pos);
      }
      items.push(this.parseValue());
      this.skipWhitespace();
      if (this.pos >= src.length) {
        throw new ParseFailure("Unexpected end of input. Expected ',' or ']'", this.pos);
      }
      const next = src.charCodeAt(this.pos);
      if (next === Ch.Comma) {
        this.pos++;
        continue;
      }
      if (next === Ch.CloseBracket) {
        this.pos++;
        return { kind: "array", items };
      }
      if (next === Ch.Colon) {
        throw new ParseFailure("Unexpected ':' in array. Did you mean to use an object '{ }'?", this.pos);
      }
      throw new ParseFailure("Expected ',' or ']' after array item. Is a comma missing?", this.pos);
    }
  }

  private parseString(): { raw: string; value: string } {
    const src = this.src;
    const start = this.pos;
    const len = src.length;
    let i = start + 1;
    let hasEscape = false;
    for (;;) {
      if (i >= len) throw new ParseFailure("Unterminated string. Missing closing double quote", start);
      const c = src.charCodeAt(i);
      if (c === Ch.Quote) break;
      if (c === Ch.Backslash) {
        hasEscape = true;
        if (i + 1 >= len) throw new ParseFailure("Unterminated string. Missing closing double quote", start);
        const e = src.charCodeAt(i + 1);
        if (e === Ch.LowerU) {
          for (let k = 2; k < 6; k++) {
            if (i + k >= len || !isHex(src.charCodeAt(i + k))) {
              throw new ParseFailure("Invalid Unicode escape. Expected \\u followed by 4 hex digits", i);
            }
          }
          i += 6;
          continue;
        }
        // " \ / b f n r t
        if (
          e === Ch.Quote ||
          e === Ch.Backslash ||
          e === Ch.Slash ||
          e === 0x62 ||
          e === 0x66 ||
          e === 0x6e ||
          e === 0x72 ||
          e === 0x74
        ) {
          i += 2;
          continue;
        }
        throw new ParseFailure(`Invalid escape sequence "\\${describeChar(src[i + 1])}" in string`, i);
      }
      if (c < 0x20) {
        throw new ParseFailure(
          c === Ch.LineFeed || c === Ch.CarriageReturn
            ? "Line break inside a string. Use \\n to include a new line, or close the string"
            : c === Ch.Tab
              ? "Unescaped tab character inside a string. Use \\t instead"
              : `Unescaped control character ${describeChar(src[i])} inside a string`,
          i,
        );
      }
      i++;
    }
    const raw = src.slice(start, i + 1);
    this.pos = i + 1;
    return { raw, value: hasEscape ? (JSON.parse(raw) as string) : raw.slice(1, -1) };
  }

  private parseNumber(): JsonNode {
    const src = this.src;
    const start = this.pos;
    let pos = this.pos;
    if (src.charCodeAt(pos) === Ch.Minus) {
      pos++;
      if (!isDigit(src.charCodeAt(pos))) {
        this.pos = pos;
        if (src.startsWith("Infinity", pos)) {
          throw new ParseFailure('"-Infinity" is not a valid JSON value', start);
        }
        throw new ParseFailure("Invalid number. Expected a digit after '-'", pos);
      }
    }
    if (src.charCodeAt(pos) === Ch.Zero) {
      pos++;
      if (isDigit(src.charCodeAt(pos))) {
        throw new ParseFailure("Numbers cannot have leading zeros", start);
      }
    } else {
      while (isDigit(src.charCodeAt(pos))) pos++;
    }
    let isInteger = true;
    if (src.charCodeAt(pos) === Ch.Dot) {
      isInteger = false;
      pos++;
      if (!isDigit(src.charCodeAt(pos))) {
        throw new ParseFailure("Invalid number. Expected a digit after the decimal point", pos);
      }
      while (isDigit(src.charCodeAt(pos))) pos++;
    }
    const e = src.charCodeAt(pos);
    if (e === Ch.LowerE || e === Ch.UpperE) {
      isInteger = false;
      pos++;
      const sign = src.charCodeAt(pos);
      if (sign === Ch.Plus || sign === Ch.Minus) pos++;
      if (!isDigit(src.charCodeAt(pos))) {
        throw new ParseFailure("Invalid number. Expected a digit in the exponent", pos);
      }
      while (isDigit(src.charCodeAt(pos))) pos++;
    }
    const raw = src.slice(start, pos);
    this.pos = pos;

    // Only check precision for long literals; short ones are always safe.
    if (raw.length > 15) {
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        this.warn(
          "unsafe-number",
          `Number ${truncate(raw)} is outside the range of a 64-bit float. Many parsers convert it to Infinity; this tool keeps it exactly as written`,
          start,
        );
      } else if (isInteger && !Number.isSafeInteger(n)) {
        this.warn(
          "unsafe-number",
          `Integer ${truncate(raw)} exceeds the safe integer range (±9007199254740991). Many parsers round it; this tool keeps every digit`,
          start,
        );
      }
    }
    return { kind: "number", raw };
  }
}

function truncate(s: string, max = 40): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

/**
 * Converts zero-based character offsets to one-based line/column pairs in a
 * single pass over the input.
 */
export function positionsToLineColumn(src: string, positions: number[]): { line: number; column: number }[] {
  const order = positions.map((p, i) => [p, i] as const).sort((a, b) => a[0] - b[0]);
  const out: { line: number; column: number }[] = new Array(positions.length);
  let line = 1;
  let lineStart = 0;
  let scan = 0;
  for (const [pos, idx] of order) {
    const target = Math.min(pos, src.length);
    while (scan < target) {
      if (src.charCodeAt(scan) === Ch.LineFeed) {
        line++;
        lineStart = scan + 1;
      }
      scan++;
    }
    out[idx] = { line, column: target - lineStart + 1 };
  }
  return out;
}

export function lineColumnOf(src: string, position: number): { line: number; column: number } {
  return positionsToLineColumn(src, [position])[0];
}

export function parseJson(input: string): ParseResult {
  if (input.trim() === "") {
    return {
      ok: false,
      error: { message: "Input is empty. Paste or upload JSON to get started", position: 0, line: 1, column: 1 },
    };
  }
  const parser = new Parser(input);
  try {
    const node = parser.parse();
    const locations = positionsToLineColumn(
      input,
      parser.warnings.map((w) => w.position),
    );
    const warnings: JsonWarning[] = parser.warnings.map((w, i) => ({ ...w, ...locations[i] }));
    return { ok: true, node, warnings };
  } catch (err) {
    let failure: ParseFailure;
    if (err instanceof ParseFailure) failure = err;
    else if (err instanceof RangeError) {
      failure = new ParseFailure("JSON is nested too deeply to be processed in the browser", parser.position);
    } else throw err;
    const { line, column } = lineColumnOf(input, failure.position);
    const error: JsonErrorInfo = { message: failure.message, position: failure.position, line, column };
    return { ok: false, error };
  }
}
