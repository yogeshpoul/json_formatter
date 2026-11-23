import { absoluteUrl, siteConfig } from "@/config/site";
import type { ToolContent } from "@/types/content";

/**
 * Schema.org JSON-LD builders. Every value mirrors content that is visible
 * on the page. FAQPage markup is intentionally not used: since 2023 Google
 * only shows FAQ rich results for authoritative government and health sites.
 */

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function webApplicationSchema(tool: ToolContent) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url: absoluteUrl(tool.href),
    description: tool.metaDescription,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript and a modern web browser",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: tool.features.map((f) => f.title),
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.shortDescription,
    inLanguage: "en",
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
