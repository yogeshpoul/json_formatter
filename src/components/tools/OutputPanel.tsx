"use client";

import { Check, Copy, Download } from "lucide-react";
import { useId, type ReactNode } from "react";
import { CodeEditor, type CodeEditorHandle } from "@/components/editor/CodeEditor";
import type { EditorLanguage } from "@/components/editor/codemirror";
import { Button } from "@/components/ui/Button";
import { useCopy } from "@/hooks/useCopy";
import { downloadText } from "@/lib/browser";
import { Panel } from "./Panel";

interface OutputPanelProps {
  title: string;
  value: string;
  filename: string;
  mimeType: string;
  language?: EditorLanguage;
  placeholder?: string;
  /** Shown instead of the editor (e.g. an error message). */
  overlay?: ReactNode;
  extraActions?: ReactNode;
  lineWrapping?: boolean;
  withBom?: boolean;
  editorRef?: React.Ref<CodeEditorHandle>;
  editorClassName?: string;
  footer?: ReactNode;
}

/** Read-only result editor with Copy and Download actions. */
export function OutputPanel({
  title,
  value,
  filename,
  mimeType,
  language = "json",
  placeholder,
  overlay,
  extraActions,
  lineWrapping,
  withBom,
  editorRef,
  editorClassName = "h-[380px] md:h-[520px]",
  footer,
}: OutputPanelProps) {
  const titleId = useId();
  const { status, copy } = useCopy();
  return (
    <Panel
      title={title}
      titleId={titleId}
      footer={footer}
      actions={
        <>
          {extraActions}
          <Button
            size="sm"
            variant="ghost"
            icon={status === "copied" ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
            onClick={() => copy(value)}
            disabled={!value || !!overlay}
          >
            {status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : "Copy"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<Download size={15} aria-hidden />}
            onClick={() => downloadText(value, filename, mimeType, withBom)}
            disabled={!value || !!overlay}
          >
            Download
          </Button>
          <span className="sr-only" aria-live="polite">
            {status === "copied" ? `${title} copied to clipboard` : ""}
          </span>
        </>
      }
    >
      {overlay ? (
        <div className={`${editorClassName} overflow-auto`}>{overlay}</div>
      ) : (
        <CodeEditor
          ref={editorRef}
          value={value}
          readOnly
          language={language}
          ariaLabel={title}
          placeholder={placeholder}
          lineWrapping={lineWrapping}
          className={editorClassName}
        />
      )}
    </Panel>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted">{children}</div>;
}

export function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <p className="font-medium text-danger">{title}</p>
      <p className="max-w-md text-sm text-muted">{message}</p>
    </div>
  );
}
