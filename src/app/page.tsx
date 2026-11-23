import { Braces, Gauge, Lock, ServerOff, ShieldCheck, UserX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { FaqList, PrivacyBanner, PrivacyPill, RelatedTools } from "@/components/content/Sections";
import { JsonLd } from "@/components/seo/JsonLd";
import { JsonWorkbench } from "@/components/tools/JsonWorkbench";
import { tools } from "@/content/tools";
import { buildMetadata } from "@/lib/seo/metadata";
import { webApplicationSchema, websiteSchema } from "@/lib/seo/schema";

const tool = tools.formatter;

export const metadata: Metadata = buildMetadata({
  title: tool.metaTitle,
  description: tool.metaDescription,
  path: "/",
  keywords: tool.keywords,
});

const HOME_FEATURES = [
  {
    icon: Lock,
    title: "Client-side processing",
    text: "Parsing, formatting and validation run in JavaScript inside your browser tab. Your JSON is never part of a network request.",
  },
  {
    icon: Gauge,
    title: "Instant formatting",
    text: "Output updates as you type. Large documents are processed in a background Web Worker so the page stays responsive.",
  },
  {
    icon: ShieldCheck,
    title: "JSON validation",
    text: "Strict RFC 8259 checks with line and column numbers, plus warnings for duplicate keys and numbers that lose precision.",
  },
  {
    icon: UserX,
    title: "No account required",
    text: "Open the page and start working. No sign-up, no login and no email address needed.",
  },
  {
    icon: ServerOff,
    title: "No backend processing",
    text: "The site is static files only. There is no server-side code, API or database that could receive your data.",
  },
  {
    icon: Braces,
    title: "Free to use",
    text: "Every tool is free for personal and commercial use, supported by unobtrusive ads that never appear inside the editor.",
  },
];

const STEPS = [
  { title: "Paste or upload JSON", text: "Paste into the input editor, drop a .json file onto it, or use Upload. Files are read locally." },
  { title: "Format or validate it", text: "Choose your indentation, sort keys if you like, and see validation results with exact error locations." },
  { title: "Copy or download the result", text: "Copy the formatted or minified JSON to your clipboard, or save it as a .json file." },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-border bg-bg-subtle">
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-8 text-center sm:px-6 sm:pt-14">
          <div className="flex justify-center">
            <PrivacyPill />
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-balance text-fg sm:text-5xl">{tool.h1}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-pretty text-muted">{tool.lead}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="#tool"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 font-medium text-accent-fg shadow-card hover:bg-accent-hover"
            >
              <Braces size={18} aria-hidden /> Format JSON
            </a>
            <Link
              href="/json-validator"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-surface px-5 font-medium text-fg shadow-card hover:border-border-strong"
            >
              <ShieldCheck size={18} aria-hidden /> Validate JSON
            </Link>
          </div>
        </div>
      </section>

      <AdSlot placement="hero" className="mt-6" />

      <section id="tool" aria-label="JSON formatter" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-6 sm:px-6">
        <JsonWorkbench mode="format" />
      </section>

      <div className="mt-14">
        <PrivacyBanner />
      </div>

      <AdSlot placement="content" className="mt-12" />

      <div className="mx-auto mt-16 max-w-7xl space-y-20 px-4 sm:px-6">
        <section aria-labelledby="features">
          <h2 id="features" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            A secure JSON formatter built for developers
          </h2>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted">
            Most online JSON formatters send what you paste to a server. This one doesn&apos;t. It is a browser-based JSON
            formatter, validator, beautifier and minifier that works entirely on your device.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-border bg-surface p-6 shadow-card">
                <span className="inline-flex rounded-lg bg-accent-soft p-2 text-accent-text">
                  <Icon size={20} aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-fg">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-xl border border-border bg-surface p-6 shadow-card">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-semibold text-accent-fg" aria-hidden>
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-fg">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="what-is" className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 id="what-is" className="text-2xl font-semibold tracking-tight">
              What is a JSON formatter?
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-muted">
              {tool.intro.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Formatting vs. minifying JSON</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-muted">
              <p>
                Formatted JSON uses line breaks and indentation so people can read it. Minified JSON removes every optional
                space so machines can transfer and store it efficiently. Both contain the same data.
              </p>
              <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-[13px] leading-relaxed text-fg">
                {`// Minified
{"user":{"id":7,"roles":["admin"]}}

// Formatted (2 spaces)
{
  "user": {
    "id": 7,
    "roles": [
      "admin"
    ]
  }
}`}
              </pre>
            </div>
          </div>
        </section>

        <RelatedTools
          heading="More free JSON tools"
          ids={["validator", "beautifier", "minifier", "viewer", "tree", "diff", "csv", "xml"]}
        />

        <AdSlot placement="inContent" />

        <div className="max-w-4xl">
          <FaqList faqs={tool.faqs} />
        </div>
      </div>

      <AdSlot placement="footer" className="mt-16" />
      <JsonLd data={[websiteSchema(), webApplicationSchema(tool)]} />
    </>
  );
}
