import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PrivacyBanner } from "@/components/content/Sections";
import { ToolIcon } from "@/components/ui/ToolIcon";
import { allTools } from "@/content/tools";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "All JSON Tools – Format, Validate, Convert & Compare",
  description:
    "Free, private JSON tools in one place: formatter, validator, minifier, beautifier, viewer, tree viewer, diff checker, JSON to CSV, JSON to XML and escape tools.",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
          ]}
        />
        <header className="mt-6 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">All JSON tools</h1>
          <p className="mt-3 text-lg leading-relaxed text-muted">
            Every tool runs entirely in your browser. Pick a tool to format, validate, explore, compare or convert JSON
            without uploading it anywhere.
          </p>
        </header>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allTools.map((tool) => (
            <li key={tool.id}>
              <Link
                href={tool.href}
                className="group flex h-full gap-4 rounded-xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-accent/50"
              >
                <span className="h-fit rounded-lg bg-accent-soft p-2.5 text-accent-text">
                  <ToolIcon name={tool.icon} size={20} />
                </span>
                <span>
                  <span className="block font-semibold text-fg group-hover:text-accent-text">{tool.name}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{tool.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-16">
        <PrivacyBanner />
      </div>
    </>
  );
}
