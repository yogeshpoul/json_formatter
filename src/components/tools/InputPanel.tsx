"use client";

import { ClipboardPaste, FileUp, FlaskConical, Trash2 } from "lucide-react";
import { useId, useImperativeHandle, useRef, useState, type DragEvent, type ReactNode, type Ref } from "react";
import { CodeEditor, type CodeEditorHandle } from "@/components/editor/CodeEditor";
import type { EditorLanguage } from "@/components/editor/codemirror";
import { Button } from "@/components/ui/Button";
import { MAX_FILE_BYTES, readClipboardText, readTextFile } from "@/lib/browser";
import { formatBytes } from "@/lib/json/process";
import { Panel } from "./Panel";

interface InputPanelProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  sample?: string;
  errorPosition?: number | null;
  language?: EditorLanguage;
  placeholder?: string;
  editorClassName?: string;
  accept?: string;
  lineWrapping?: boolean;
  extraActions?: ReactNode;
  editorRef?: Ref<CodeEditorHandle>;
  /** Lets parents trigger the file picker (e.g. from a keyboard shortcut). */
  panelRef?: Ref<InputPanelHandle>;
}

export interface InputPanelHandle {
  openFilePicker(): void;
}

/**
 * Input editor with Upload, Paste, Sample and Clear actions plus drag-and-drop.
 * Files are read locally with the File API and never uploaded.
 */
export function InputPanel({
  title,
  value,
  onChange,
  sample,
  errorPosition,
  language = "json",
  placeholder = "Paste your JSON here, or drop a .json file…",
  editorClassName = "h-[380px] md:h-[520px]",
  accept = ".json,.geojson,.txt,application/json,text/plain",
  lineWrapping,
  extraActions,
  editorRef,
  panelRef,
}: InputPanelProps) {
  const titleId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<{ text: string; tone: "info" | "error" } | null>(null);
  const [dragging, setDragging] = useState(false);

  useImperativeHandle(panelRef, () => ({ openFilePicker: () => fileInput.current?.click() }), []);

  const loadFile = async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      setNotice({ text: `${file.name} is ${formatBytes(file.size)}, which is larger than the ${formatBytes(MAX_FILE_BYTES)} limit.`, tone: "error" });
      return;
    }
    try {
      const text = await readTextFile(file);
      onChange(text);
      setNotice({ text: `Opened ${file.name} (${formatBytes(file.size)}) locally. The file was not uploaded.`, tone: "info" });
    } catch {
      setNotice({ text: `Could not read ${file.name}. Make sure it is a text file.`, tone: "error" });
    }
  };

  const paste = async () => {
    const text = await readClipboardText();
    if (text === null) {
      setNotice({ text: "Your browser blocked clipboard access. Click in the editor and press Ctrl+V (⌘+V on Mac).", tone: "error" });
      return;
    }
    onChange(text);
    setNotice(null);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    const file = event.dataTransfer.files?.[0];
    setDragging(false);
    if (!file) return;
    event.preventDefault();
    event.stopPropagation();
    void loadFile(file);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes("Files")) {
      event.preventDefault();
      setDragging(true);
    }
  };

  return (
    <Panel
      title={title}
      titleId={titleId}
      actions={
        <>
          <Button
            size="sm"
            variant="ghost"
            icon={<FileUp size={15} aria-hidden />}
            onClick={() => fileInput.current?.click()}
          >
            Upload
          </Button>
          <Button size="sm" variant="ghost" icon={<ClipboardPaste size={15} aria-hidden />} onClick={paste}>
            Paste
          </Button>
          {sample !== undefined && (
            <Button
              size="sm"
              variant="ghost"
              icon={<FlaskConical size={15} aria-hidden />}
              onClick={() => {
                onChange(sample);
                setNotice(null);
              }}
            >
              Sample
            </Button>
          )}
          {extraActions}
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 size={15} aria-hidden />}
            onClick={() => {
              onChange("");
              setNotice(null);
            }}
            disabled={value === ""}
          >
            Clear
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept={accept}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void loadFile(file);
              e.target.value = "";
            }}
          />
        </>
      }
      footer={
        <p
          aria-live="polite"
          className={`min-h-0 border-t border-border px-3 py-1.5 text-xs empty:hidden ${
            notice?.tone === "error" ? "text-danger" : "text-muted"
          }`}
        >
          {notice?.text}
        </p>
      }
    >
      <div
        className={`relative ${dragging ? "ring-2 ring-accent ring-inset" : ""}`}
        onDropCapture={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
      >
        <CodeEditor
          ref={editorRef}
          value={value}
          onChange={onChange}
          language={language}
          ariaLabel={`${title} editor`}
          placeholder={placeholder}
          errorPosition={errorPosition}
          lineWrapping={lineWrapping}
          className={editorClassName}
        />
        {dragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-accent-soft/80 text-sm font-medium text-accent-text">
            Drop file to open it locally
          </div>
        )}
      </div>
    </Panel>
  );
}
