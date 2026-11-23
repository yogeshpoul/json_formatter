import { describe, expect, it } from "vitest";
import { getErrorContext } from "@/lib/json/context";

describe("getErrorContext", () => {
  it("returns surrounding lines and marks the error line", () => {
    const input = "a\nb\nc\nd\ne";
    const { lines, caretColumn } = getErrorContext(input, 3, 1);
    expect(lines.map((l) => l.number)).toEqual([1, 2, 3, 4]);
    expect(lines.find((l) => l.isErrorLine)?.text).toBe("c");
    expect(caretColumn).toBe(1);
  });

  it("windows very long lines around the caret", () => {
    const input = "x".repeat(1000) + "!" + "y".repeat(1000);
    const { lines, caretColumn } = getErrorContext(input, 1, 1001);
    expect(lines[0].text.length).toBeLessThan(170);
    expect(lines[0].text[caretColumn - 1]).toBe("!");
  });
});
