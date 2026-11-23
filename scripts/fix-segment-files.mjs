// Works around a Next.js static-export bug on Windows: segment prefetch files
// are written as `route/__next.route/__PAGE__.txt` (backslash paths are not
// flattened) while the client requests `route/__next.route.__PAGE__.txt`.
// On Linux (including Vercel) Next already writes flat names, so this is a no-op.
import { readdirSync, statSync, renameSync, rmSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = join(process.cwd(), "out");

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (name.startsWith("__next.")) flatten(full, dir);
    else walk(full);
  }
}

function flatten(segmentDir, parent) {
  const files = [];
  const collect = (d) => {
    for (const n of readdirSync(d)) {
      const f = join(d, n);
      if (statSync(f).isDirectory()) collect(f);
      else files.push(f);
    }
  };
  collect(segmentDir);
  for (const file of files) {
    const flat = relative(parent, file).split(sep).join(".");
    renameSync(file, join(parent, flat));
  }
  rmSync(segmentDir, { recursive: true, force: true });
}

if (process.platform === "win32") {
  try {
    walk(OUT);
    console.log("[segments] flattened prefetch segment files for Windows build");
  } catch (err) {
    console.warn("[segments] skipped:", err.message);
  }
}
