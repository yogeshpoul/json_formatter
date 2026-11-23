# PrivateJSON: Secure, Browser-Based JSON Formatter

A privacy-first JSON formatter, validator and developer toolkit. Every tool runs entirely in the visitor's browser. JSON is never uploaded, stored or sent anywhere.

**Tools:** JSON Formatter (home), Validator, Minifier, Beautifier, Viewer, Tree Viewer, Diff Checker, JSON to CSV, JSON to XML, Escape / Unescape.

- **Stack:** Next.js 16 (App Router, static export), React 19, TypeScript, Tailwind CSS v4, CodeMirror 6, Lucide icons
- **Hosting:** static files on Vercel. No server, no API routes, no database, no required environment variables.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the design and privacy guarantees, and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Vercel, custom domain, Google Search Console and AdSense setup.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit + privacy tests (Vitest)
npm run lint
npm run typecheck
npm run build      # static site in ./out
npm start          # serve ./out locally
```

Requires Node.js 20.9 or newer.

## Configuration

Every variable is optional. Copy `.env.example` to `.env.local` for local development, or set them in Vercel → Project → Settings → Environment Variables.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, e.g. `https://www.example.com`. Defaults to Vercel's production URL. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email address shown on `/contact`. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console meta-tag code. |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense publisher ID (`ca-pub-` + 16 digits). Enables ads and generates `ads.txt`. |
| `NEXT_PUBLIC_ADSENSE_SLOT_HERO` / `_CONTENT` / `_IN_CONTENT` / `_FOOTER` | AdSense ad unit slot IDs for each placement. |

Values are baked in at build time, so **redeploy after changing them**.

The brand name, tagline and legal "last updated" date are set in [src/config/site.ts](src/config/site.ts). The social preview image is [public/og-image.png](public/og-image.png) (1200×630). Replace it if you rename the site.

## Project structure

```
src/
  app/                 Routes: one folder per tool and content page; sitemap.ts, robots.ts
  components/
    ads/               AdSense script loader and ad slots (render nothing unless configured)
    content/           Tool page template, FAQ, features, privacy banner, content page layout
    editor/            Lazy-loaded CodeMirror 6 editor (with textarea fallback)
    layout/            Header, footer, breadcrumbs, theme toggle
    seo/               JSON-LD renderer
    tools/             Interactive tools (workbench, viewer, tree, diff, CSV, XML, escape)
    ui/                Buttons, segmented control, checkbox, icons
  config/              Site and AdSense configuration
  content/             Page copy per tool (SEO text, FAQs) and sample data
  hooks/               Processing, parsing, copy, shortcut hooks
  lib/
    json/              Framework-independent JSON engine (parser, formatter, converters, diff)
    seo/               Metadata and Schema.org builders
    browser.ts         Clipboard, file reading and Blob downloads
  types/               Shared types
  workers/             Web Worker for large inputs
tests/                 Vitest suites (engine, converters, privacy guarantees)
scripts/               Build helpers (ads.txt generation, Windows export fix)
```

## Adding a new tool

1. Put the pure logic in `src/lib/json/` and add tests in `tests/`.
2. Build the UI in `src/components/tools/`, reusing `InputPanel`, `OutputPanel` and `StatusBar`.
3. Add the tool's copy (title, description, intro, how-to, features, FAQs, related tools) to `src/content/tools.ts`.
4. Create `src/app/<slug>/page.tsx` using the `ToolPage` template. Navigation, footer, the tools index and the sitemap pick it up automatically.
