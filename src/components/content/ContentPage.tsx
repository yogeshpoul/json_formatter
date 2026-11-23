import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

interface ContentPageProps {
  title: string;
  path: string;
  lead?: ReactNode;
  updated?: string;
  children: ReactNode;
}

/** Layout for long-form pages such as Privacy, Terms and About. */
export function ContentPage({ title, path, lead, updated, children }: ContentPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: title, path },
        ]}
      />
      <header className="mt-6 border-b border-border pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{title}</h1>
        {lead && <p className="mt-3 text-lg leading-relaxed text-muted">{lead}</p>}
        {updated && (
          <p className="mt-3 text-sm text-subtle">
            Last updated: <time dateTime={updated}>{new Date(`${updated}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time>
          </p>
        )}
      </header>
      <div className="prose-content pb-4">{children}</div>
    </div>
  );
}
