import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";
import { allTools } from "@/content/tools";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${siteConfig.legalUpdated}T00:00:00Z`);
  const toolEntries = allTools.map((tool) => ({
    url: absoluteUrl(tool.href),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: tool.href === "/" ? 1 : 0.8,
  }));
  const pages = ["/tools", "/privacy", "/about", "/privacy-policy", "/terms", "/contact"].map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "yearly" as const,
    priority: path === "/tools" || path === "/privacy" ? 0.6 : 0.3,
  }));
  return [...toolEntries, ...pages];
}
