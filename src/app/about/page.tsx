import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content/ContentPage";
import { siteConfig } from "@/config/site";
import { allTools } from "@/content/tools";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: `About ${siteConfig.name} – Private JSON Tools for Developers`,
  description: `${siteConfig.name} builds fast, free JSON tools that run entirely in your browser, so developers can work with sensitive data without uploading it.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <ContentPage
      title="About Us"
      path="/about"
      lead={`${siteConfig.name} is a set of free JSON tools built on a simple principle: your data should stay on your device.`}
    >
      <h2>Why we built this</h2>
      <p>
        Developers paste JSON into online tools every day: API responses with access tokens, configuration files with
        credentials, exports with customer records. Many of those tools send everything to a server for processing, often
        without saying so.
      </p>
      <p>
        We wanted a JSON formatter we would be comfortable using at work, so we built one where formatting, validation and
        conversion happen entirely in the browser. There is no backend to send your data to. Read more on our{" "}
        <Link href="/privacy">Privacy &amp; Security</Link> page.
      </p>

      <h2>What we care about</h2>
      <ul>
        <li>
          <strong>Privacy:</strong> no uploads, no storage of your JSON, and no analytics on editor content.
        </li>
        <li>
          <strong>Correctness:</strong> strict standards-based parsing, and formatting that never silently changes values,
          including large numbers.
        </li>
        <li>
          <strong>Speed:</strong> static pages that load fast, and background processing for large files.
        </li>
        <li>
          <strong>Accessibility:</strong> full keyboard support, screen-reader-friendly messages and readable contrast in
          light and dark themes.
        </li>
      </ul>

      <h2>Our tools</h2>
      <ul>
        {allTools.map((tool) => (
          <li key={tool.id}>
            <Link href={tool.href}>{tool.name}</Link>: {tool.summary}
          </li>
        ))}
      </ul>

      <h2>How the site is funded</h2>
      <p>
        The tools are free. To cover hosting and development we may show a small number of clearly labelled ads, placed away
        from the editors. Ads never receive the JSON you work with.
      </p>

      <h2>Get in touch</h2>
      <p>
        Found a bug or have an idea for a new tool? Visit the <Link href="/contact">contact page</Link>.
      </p>
    </ContentPage>
  );
}
