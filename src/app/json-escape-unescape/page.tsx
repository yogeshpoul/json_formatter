import type { Metadata } from "next";
import { ToolPage } from "@/components/content/ToolPage";
import { EscapeTool } from "@/components/tools/EscapeTool";
import { tools } from "@/content/tools";
import { buildMetadata } from "@/lib/seo/metadata";

const tool = tools.escape;

export const metadata: Metadata = buildMetadata({
  title: tool.metaTitle,
  description: tool.metaDescription,
  path: tool.href,
  keywords: tool.keywords,
});

export default function Page() {
  return (
    <ToolPage tool={tool}>
      <EscapeTool />
    </ToolPage>
  );
}
