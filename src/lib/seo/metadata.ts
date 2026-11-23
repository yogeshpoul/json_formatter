import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  /** Set for pages that should not appear in search results. */
  noIndex?: boolean;
}

/**
 * Builds complete, unique metadata for a page: title, description,
 * canonical URL, Open Graph and Twitter/X card tags.
 */
const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: `${siteConfig.name}: secure, private, browser-based JSON formatter`,
};

export function buildMetadata({ title, description, path, keywords, noIndex }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true },
  };
}
