import { ChevronDown, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { tools } from "@/content/tools";
import { ToolIcon } from "@/components/ui/ToolIcon";
import type { Faq, Feature, ToolId } from "@/types/content";

export function PrivacyPill() {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-[13px] font-medium text-accent-text">
      <Lock size={14} aria-hidden />
      Processed locally in your browser. Never uploaded.
    </p>
  );
}

export function PrivacyBanner() {
  return (
    <section aria-labelledby="privacy-banner" className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col gap-5 rounded-2xl border border-accent/30 bg-accent-soft p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-fg">
          <ShieldCheck size={26} aria-hidden />
        </div>
        <div className="flex-1">
          <h2 id="privacy-banner" className="text-xl font-semibold tracking-tight text-fg">
            Private by Design. Your JSON Never Leaves Your Browser.
          </h2>
          <p className="mt-2 max-w-3xl leading-relaxed text-muted">{siteConfig.privacyStatement}</p>
        </div>
        <Link
          href="/privacy"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-accent/40 bg-surface px-4 text-sm font-medium text-accent-text hover:bg-surface-2"
        >
          How it works
        </Link>
      </div>
    </section>
  );
}

export function FeatureGrid({ features, heading, id }: { features: Feature[]; heading: string; id: string }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-2xl font-semibold tracking-tight">
        {heading}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <li key={f.title} className="rounded-xl border border-border bg-surface p-5 shadow-card">
            <h3 className="font-semibold text-fg">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HowTo({ title, steps, id }: { title: string; steps: string[]; id: string }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4 rounded-xl border border-border bg-surface p-5 shadow-card">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-fg" aria-hidden>
              {i + 1}
            </span>
            <p className="pt-1 text-sm leading-relaxed text-muted">
              <span className="sr-only">Step {i + 1}: </span>
              {step}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function FaqList({ faqs, id = "faq" }: { faqs: Faq[]; id?: string }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-2xl font-semibold tracking-tight">
        Frequently asked questions
      </h2>
      <div className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        {faqs.map((faq) => (
          <details key={faq.question} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
              <h3 className="font-medium text-fg">{faq.question}</h3>
              <ChevronDown size={18} aria-hidden className="shrink-0 text-subtle transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 leading-relaxed text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function RelatedTools({ ids, heading = "Related tools", id = "related-tools" }: { ids: ToolId[]; heading?: string; id?: string }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-2xl font-semibold tracking-tight">
        {heading}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ids.map((toolId) => {
          const tool = tools[toolId];
          return (
            <li key={tool.id}>
              <Link
                href={tool.href}
                className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-accent/50"
              >
                <span className="w-fit rounded-lg bg-accent-soft p-2 text-accent-text">
                  <ToolIcon name={tool.icon} size={18} />
                </span>
                <span className="font-semibold text-fg group-hover:text-accent-text">{tool.name}</span>
                <span className="text-sm leading-relaxed text-muted">{tool.summary}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
