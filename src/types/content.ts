export type ToolId =
  | "formatter"
  | "validator"
  | "minifier"
  | "beautifier"
  | "viewer"
  | "csv"
  | "xml"
  | "escape"
  | "diff"
  | "tree";

export type ToolIcon =
  | "braces"
  | "shield-check"
  | "minimize"
  | "sparkles"
  | "eye"
  | "table"
  | "code"
  | "quote"
  | "git-compare"
  | "network";

export interface Faq {
  question: string;
  answer: string;
}

export interface Feature {
  title: string;
  text: string;
}

export interface ToolContent {
  id: ToolId;
  href: string;
  /** Short name for navigation and cards. */
  name: string;
  icon: ToolIcon;
  /** One-line summary for cards and menus. */
  summary: string;
  /** <title>, max ~60 characters. */
  metaTitle: string;
  /** Meta description, max ~160 characters. */
  metaDescription: string;
  h1: string;
  lead: string;
  intro: string[];
  howTo: { title: string; steps: string[] };
  features: Feature[];
  faqs: Faq[];
  related: ToolId[];
  keywords: string[];
}
