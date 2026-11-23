"use client";

import { useEffect, useState } from "react";
import { parseJson } from "@/lib/json/parser";
import type { ParseResult } from "@/lib/json/types";

/**
 * Parses JSON into a lossless tree after the user pauses typing.
 * Returns null while the input is empty.
 */
export function useParsedJson(input: string): ParseResult | null {
  const [result, setResult] = useState<ParseResult | null>(null);

  useEffect(() => {
    const delay = input.length > 1_000_000 ? 500 : 200;
    const timer = setTimeout(() => setResult(input.trim() === "" ? null : parseJson(input)), delay);
    return () => clearTimeout(timer);
  }, [input]);

  return input.trim() === "" ? null : result;
}
