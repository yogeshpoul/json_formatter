import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content/ContentPage";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: `Contact | ${siteConfig.name}`,
  description: `Contact the ${siteConfig.name} team to report a bug, suggest a JSON tool or ask a privacy question.`,
  path: "/contact",
});

export default function ContactPage() {
  const email = siteConfig.contactEmail;
  return (
    <ContentPage title="Contact" path="/contact" lead="We'd love to hear about bugs, feature ideas and new tools you'd find useful.">
      {email ? (
        <div className="not-prose my-6 flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-card">
          <span className="rounded-lg bg-accent-soft p-2.5 text-accent-text">
            <Mail size={22} aria-hidden />
          </span>
          <div>
            <p className="text-sm text-muted">Email us at</p>
            <a href={`mailto:${email}`} className="text-lg font-semibold">
              {email}
            </a>
          </div>
        </div>
      ) : (
        <p>
          The contact email address for this site has not been published yet. Please check back soon.
        </p>
      )}

      <h2>Reporting a bug</h2>
      <p>To help us fix a problem quickly, please include:</p>
      <ul>
        <li>which tool you were using, for example the JSON Formatter or JSON to CSV;</li>
        <li>your browser and operating system;</li>
        <li>what you expected to happen and what happened instead;</li>
        <li>a small, made-up JSON sample that reproduces the issue.</li>
      </ul>

      <h2>Please don&apos;t send confidential data</h2>
      <p>
        Our tools never send your JSON to us, and we never need your real data to help. Please replace tokens, passwords and
        personal information with dummy values before sharing an example. Learn more on the{" "}
        <Link href="/privacy">Privacy &amp; Security</Link> page.
      </p>
    </ContentPage>
  );
}
