# Architecture

## Goals, in priority order

1. Privacy: JSON never leaves the device.
2. Correct JSON processing that never silently changes values.
3. User experience.
4. SEO.
5. Performance.
6. Monetization with AdSense, without interfering with the tools.

## Rendering model

The site is built with Next.js `output: "export"`. `next build` pre-renders every route to static HTML in `out/`, and Vercel serves those files from its CDN.

Because there is no server runtime, API routes, server actions, middleware and server-side data processing can't exist in production. The test suite also fails if any `route.ts`, `"use server"` or `next/server` import is added.

The pages themselves (headings, educational content, FAQs, structured data) are server-rendered HTML, which is good for SEO and first paint. Each interactive tool is a client component that hydrates on top.

## JSON engine (`src/lib/json`)

The engine is pure TypeScript with no React or DOM dependency, so it can be tested in Node and run inside a Web Worker.

| Module | Responsibility |
| --- | --- |
| `parser.ts` | Strict RFC 8259 parser that produces a **lossless syntax tree**. Numbers and strings keep their source text. Errors carry message, offset, line and column. Warnings cover duplicate keys and numbers outside IEEE-754 safe range. |
| `format.ts` | Pretty-print (2 spaces, 4 spaces, tab) and minify from the tree, with optional recursive key sorting. Output layout matches `JSON.stringify`. |
| `process.ts` | One call that validates, formats and gathers stats (`processJson`). |
| `csv.ts`, `xml.ts` | Converters. CSV follows RFC 4180 with optional flattening; XML always produces well-formed output, and renamed keys are reported. |
| `escape.ts` | Escape and unescape via native `JSON.stringify` / `JSON.parse`. |
| `diff.ts` | Structural diff with JSONPath locations. Key order is ignored, numbers are compared by value, and large integers exactly. |
| `context.ts` | Code excerpt around an error, for the validation report. |

**Why a custom parser and not only `JSON.parse`?**

- `JSON.parse("12345678901234567890")` returns `12345678901234567000`. A formatter built on `JSON.parse` + `JSON.stringify` silently corrupts IDs. Formatting from the lossless tree keeps every digit, `1.50` stays `1.50`, and `é` stays `é`.
- Duplicate keys collapse silently with `JSON.parse`. Here they're preserved and flagged.
- Browser error messages differ, and Safari gives no position. The custom parser gives the same line, column and explanation everywhere, with hints such as "Trailing comma before '}' is not allowed".
- Escaped strings are still decoded with native `JSON.parse`, and the parser is tested to accept and reject exactly what `JSON.parse` does.

## Performance

- **CodeMirror 6** is loaded with a dynamic `import()` after hydration. Until then, a textarea of identical size is shown, so there is no layout shift and typing works immediately. CodeMirror only renders visible lines, which keeps multi-megabyte documents smooth.
- Inputs over 256 KB are processed in a **Web Worker** (`src/workers/json.worker.ts`), so typing and scrolling never block. If workers are unavailable, processing falls back to the main thread.
- Processing is debounced while the user types. Results from stale requests are discarded.
- The tree viewer renders children only when expanded and pages large collections in groups of 100.
- System font stacks are used, so no web fonts are downloaded.

## Privacy guarantees and how they're enforced

| Guarantee | Enforcement |
| --- | --- |
| No server processing | Static export; no route handlers or server actions (tested). |
| No network calls with JSON | No `fetch`, XHR, `sendBeacon`, WebSocket or EventSource anywhere in `src/` (static scan test). A runtime test stubs all of them and runs every tool. An end-to-end check during development recorded every request while using all tools with a secret marker and confirmed the marker never appeared. |
| No persistence | Storage APIs are forbidden in `src/` except `ThemeToggle.tsx`, which may only write `"light"` or `"dark"` (tested). No cookies are set. |
| Files stay local | Uploads use `File.text()`. Downloads use in-memory Blobs. |
| No editor content to third parties | The AdSense loader receives only its publisher ID. Ads are never placed inside tool areas. |
| Safe rendering | JSON is rendered as text (React escaping or CodeMirror), never as HTML. JSON-LD output escapes `<`. |

Security headers (HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`) are set in `vercel.json`.

## SEO strategy

- **One page per user intent** (formatter, validator, minifier, beautifier and so on), each with a unique title, meta description, H1, introduction, how-to, features, FAQs and related-tool links. This avoids thin or duplicate programmatic pages.
- The home page targets the head terms ("JSON formatter", "online / free / secure / browser-based JSON formatter"). Tool pages target their own terms.
- Every page has a canonical URL, Open Graph and Twitter card tags, and a shared 1200×630 preview image.
- **Structured data:** `WebSite` and `WebApplication` on the home page, `WebApplication` on each tool, and `BreadcrumbList` wherever breadcrumbs are visible. `FAQPage` is intentionally omitted: since August 2023 Google shows FAQ rich results only for authoritative government and health sites. FAQs remain as visible content.
- `sitemap.xml` and `robots.txt` are generated at build time from the tool registry.
- Semantic HTML: one H1 per page, an ordered heading hierarchy, `nav`/`main`/`footer` landmarks, and a skip link.

## Accessibility

- All controls are native buttons, links or inputs, with visible focus rings.
- Segmented controls are radio groups. Result tabs use the tablist pattern with arrow-key support. Menus are disclosure buttons that close on Escape and on outside click.
- Validation results go to a polite live region, announced only when validity changes or on an explicit Validate, not on every keystroke.
- Editors have accessible names. Press Esc then Tab to leave an editor, since Tab inserts indentation.
- Colors are tuned for WCAG AA contrast in both themes, and `prefers-reduced-motion` is respected.
