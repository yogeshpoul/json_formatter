"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { processJson } from "@/lib/json/process";
import type { FormatOptions, ProcessResult } from "@/lib/json/types";
import type { WorkerRequest, WorkerResponse } from "@/workers/json.worker";

/** Inputs larger than this are processed in a Web Worker. */
export const WORKER_THRESHOLD = 256 * 1024;

interface ProcessorState {
  result: ProcessResult | null;
  busy: boolean;
}

/**
 * Validates and formats JSON as the input changes (debounced). Small inputs
 * are processed synchronously; large ones in a Web Worker so typing and
 * scrolling stay smooth.
 */
export function useJsonProcessor(input: string, options: FormatOptions) {
  const [state, setState] = useState<ProcessorState>({ result: null, busy: false });
  const workerRef = useRef<Worker | null>(null);
  const workerFailed = useRef(false);
  const requestId = useRef(0);

  const getWorker = useCallback((): Worker | null => {
    if (workerFailed.current || typeof Worker === "undefined") return null;
    if (!workerRef.current) {
      try {
        const worker = new Worker(new URL("../workers/json.worker.ts", import.meta.url), { type: "module" });
        worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
          if (event.data.id === requestId.current) setState({ result: event.data.result, busy: false });
        };
        workerRef.current = worker;
      } catch {
        workerFailed.current = true;
        return null;
      }
    }
    return workerRef.current;
  }, []);

  const run = useCallback(
    (text: string, opts: FormatOptions) => {
      const id = ++requestId.current;
      const worker = text.length > WORKER_THRESHOLD ? getWorker() : null;
      if (worker) {
        setState((s) => ({ ...s, busy: true }));
        worker.onerror = () => {
          // Fall back to the main thread if the worker cannot run.
          workerFailed.current = true;
          worker.terminate();
          workerRef.current = null;
          if (id === requestId.current) setState({ result: processJson(text, opts), busy: false });
        };
        worker.postMessage({ id, input: text, options: opts } satisfies WorkerRequest);
      } else {
        setState({ result: processJson(text, opts), busy: false });
      }
    },
    [getWorker],
  );

  const { indent, sortKeys } = options;
  useEffect(() => {
    const delay = input.length > WORKER_THRESHOLD ? 400 : 150;
    const timer = setTimeout(() => run(input, { indent, sortKeys }), delay);
    return () => clearTimeout(timer);
  }, [input, indent, sortKeys, run]);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    },
    [],
  );

  const runNow = useCallback(() => run(input, { indent, sortKeys }), [run, input, indent, sortKeys]);

  return { result: state.result, busy: state.busy, runNow };
}
