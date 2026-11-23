import type { Metadata } from "next";
import { ToolPage } from "@/components/content/ToolPage";
import { ViewerTool } from "@/components/tools/ViewerTool";
import { tools } from "@/content/tools";
import { buildMetadata } from "@/lib/seo/metadata";

const tool = tools.viewer;

export const metadata: Metadata = buildMetadata({
  title: tool.metaTitle,
  description: tool.metaDescription,
  path: tool.href,
  keywords: tool.keywords,
});

export default function Page() {
  return (
    <ToolPage tool={tool}>
      <ViewerTool />
    </ToolPage>
  );
}
