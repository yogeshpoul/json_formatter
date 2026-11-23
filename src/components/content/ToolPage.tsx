import type { ReactNode } from "react";
import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { webApplicationSchema } from "@/lib/seo/schema";
import type { ToolContent } from "@/types/content";
import { FaqList, FeatureGrid, HowTo, PrivacyBanner, PrivacyPill, RelatedTools } from "./Sections";

/**
 * Shared layout for tool pages: heading, the interactive tool, and unique
 * educational content (intro, how-to, features, FAQ, related tools).
 */
export function ToolPage({ tool, children }: { tool: ToolContent; children: ReactNode }) {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: tool.name, path: tool.href },
          ]}
        />
        <header className="mt-5 mb-6 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{tool.h1}</h1>
          <p className="mt-3 text-lg leading-relaxed text-muted">{tool.lead}</p>
          <div className="mt-4">
            <PrivacyPill />
          </div>
        </header>
        <div id="tool">{children}</div>
      </div>

      <AdSlot placement="content" className="mt-12" />

      <div className="mx-auto mt-14 max-w-7xl space-y-16 px-4 sm:px-6">
        <section aria-labelledby="about-tool" className="max-w-3xl">
          <h2 id="about-tool" className="text-2xl font-semibold tracking-tight">
            About the {tool.name}
          </h2>
          <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-muted">
            {tool.intro.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </section>
        <HowTo id="how-to" title={tool.howTo.title} steps={tool.howTo.steps} />
        <FeatureGrid id="features" heading="Features" features={tool.features} />
      </div>

      <div className="mt-16">
        <PrivacyBanner />
      </div>

      <AdSlot placement="inContent" className="mt-12" />

      <div className="mx-auto mt-14 max-w-7xl space-y-16 px-4 sm:px-6">
        <div className="max-w-4xl">
          <FaqList faqs={tool.faqs} />
        </div>
        <RelatedTools ids={tool.related} />
      </div>

      <AdSlot placement="footer" className="mt-16" />
      <JsonLd data={webApplicationSchema(tool)} />
    </>
  );
}
