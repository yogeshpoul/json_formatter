/**
 * Browser helpers for clipboard, files and downloads. Everything here works
 * on local data only: files are read with the File API and downloads are
 * created from in-memory Blobs. Nothing is sent over the network.
 */

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers or contexts without the async Clipboard API.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

export async function readClipboardText(): Promise<string | null> {
  try {
    if (!navigator.clipboard?.readText) return null;
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

const BOM = String.fromCharCode(0xfeff);

export function downloadText(text: string, filename: string, mimeType: string, withBom = false) {
  const parts: BlobPart[] = withBom ? [BOM, text] : [text];
  const blob = new Blob(parts, { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Reads a local file as UTF-8 text and normalises line endings. */
export async function readTextFile(file: File): Promise<string> {
  const text = await file.text();
  const withoutBom = text.startsWith(BOM) ? text.slice(1) : text;
  return withoutBom.replace(/\r\n?/g, "\n");
}

export const MAX_FILE_BYTES = 200 * 1024 * 1024;
