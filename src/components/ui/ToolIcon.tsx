import { Braces, Code2, Eye, GitCompare, Minimize2, Network, Quote, ShieldCheck, Sparkles, Table2, type LucideProps } from "lucide-react";
import type { ToolIcon as ToolIconName } from "@/types/content";

const ICONS: Record<ToolIconName, React.ComponentType<LucideProps>> = {
  braces: Braces,
  "shield-check": ShieldCheck,
  minimize: Minimize2,
  sparkles: Sparkles,
  eye: Eye,
  table: Table2,
  code: Code2,
  quote: Quote,
  "git-compare": GitCompare,
  network: Network,
};

export function ToolIcon({ name, ...props }: { name: ToolIconName } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden {...props} />;
}
