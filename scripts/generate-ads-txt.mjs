// Generates public/ads.txt at build time from NEXT_PUBLIC_ADSENSE_CLIENT_ID.
// If the variable is not set, any previously generated ads.txt is removed so
// we never publish an invalid or fabricated publisher ID.
import { writeFileSync, rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve(process.cwd(), "public", "ads.txt");
const client = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "").trim();
const match = /^ca-pub-(\d{16})$/.exec(client);

if (match) {
  const line = `google.com, pub-${match[1]}, DIRECT, f08c47fec0942fa0\n`;
  writeFileSync(target, line, "utf8");
  console.log(`[ads.txt] generated for pub-${match[1]}`);
} else {
  if (existsSync(target)) rmSync(target);
  if (client) {
    console.warn(`[ads.txt] NEXT_PUBLIC_ADSENSE_CLIENT_ID "${client}" is not a valid ca-pub ID; ads.txt not generated.`);
  } else {
    console.log("[ads.txt] AdSense not configured; skipping.");
  }
}
