import type { Metadata } from "next";
import Link from "next/link";
import { allTools } from "@/content/tools";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <p className="font-mono text-sm font-semibold text-accent-text">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted">The page you were looking for doesn&apos;t exist. Try one of our JSON tools instead.</p>
      <ul className="mt-8 flex flex-wrap justify-center gap-2">
        {allTools.map((tool) => (
          <li key={tool.id}>
            <Link href={tool.href} className="inline-block rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:border-accent/50">
              {tool.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
