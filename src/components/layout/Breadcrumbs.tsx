import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, type BreadcrumbItem } from "@/lib/seo/schema";

/** Visible breadcrumb trail plus matching BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="inline-flex items-center gap-1">
                {last ? (
                  <span aria-current="page" className="text-fg">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className="hover:text-fg">
                      {item.name}
                    </Link>
                    <ChevronRight size={13} aria-hidden className="text-subtle" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(items)} />
    </>
  );
}
