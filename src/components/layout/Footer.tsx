import { Lock } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { allTools } from "@/content/tools";
import { Logo } from "./Logo";

const COMPANY = [
  { href: "/about", label: "About Us" },
  { href: "/privacy", label: "Privacy & Security" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms and Conditions" },
  { href: "/contact", label: "Contact" },
  { href: "/tools", label: "All Tools" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-border bg-bg-subtle">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_2fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Free, browser-based JSON tools for developers. Your JSON is processed locally on your device and is never uploaded.
          </p>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            <Lock size={13} aria-hidden className="text-accent-text" /> No uploads · No accounts · No JSON storage
          </p>
        </div>
        <nav aria-label="JSON tools">
          <h2 className="text-sm font-semibold text-fg">JSON tools</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {allTools.map((tool) => (
              <li key={tool.id}>
                <Link href={tool.href} className="text-muted hover:text-fg">
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Company">
          <h2 className="text-sm font-semibold text-fg">Company</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {COMPANY.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted hover:text-fg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-subtle sm:px-6">
          © {year} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
