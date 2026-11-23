import { processJson } from "@/lib/json/process";
import type { FormatOptions, ProcessResult } from "@/lib/json/types";

export interface WorkerRequest {
  id: number;
  input: string;
  options: FormatOptions;
}

export interface WorkerResponse {
  id: number;
  result: ProcessResult;
}

// Runs inside a dedicated Web Worker: the same pure function as the main
// thread, just off the UI thread so large inputs don't freeze the page.
// The worker has no network code and only talks to the page that created it.
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, input, options } = event.data;
  const result = processJson(input, options);
  (self as unknown as { postMessage(message: WorkerResponse): void }).postMessage({ id, result } satisfies WorkerResponse);
};
