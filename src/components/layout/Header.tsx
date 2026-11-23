"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ToolIcon } from "@/components/ui/ToolIcon";
import { allTools, tools } from "@/content/tools";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const PRIMARY = [tools.formatter, tools.validator, tools.minifier];
const OTHER = allTools.filter((t) => !PRIMARY.includes(t));
const PAGES = [
  { href: "/privacy", label: "Privacy" },
  { href: "/about", label: "About" },
];

function navClass(active: boolean) {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    active ? "text-fg bg-surface-2" : "text-muted hover:text-fg hover:bg-surface-2"
  }`;
}

function ToolsMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const active = OTHER.some((t) => t.href === pathname);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={`${navClass(active)} inline-flex items-center gap-1`}
      >
        Other Tools
        <ChevronDown size={15} aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={menuId}
        hidden={!open}
        className="absolute right-0 z-50 mt-2 w-[340px] rounded-xl border border-border bg-surface p-2 shadow-raised"
      >
        <ul className="grid gap-0.5">
          {OTHER.map((tool) => (
            <li key={tool.id}>
              <Link
                href={tool.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === tool.href ? "page" : undefined}
                className="flex items-start gap-3 rounded-lg px-2.5 py-2 hover:bg-surface-2"
              >
                <span className="mt-0.5 rounded-md bg-accent-soft p-1.5 text-accent-text">
                  <ToolIcon name={tool.icon} size={16} />
                </span>
                <span>
                  <span className="block text-sm font-medium text-fg">{tool.name}</span>
                  <span className="block text-xs text-muted">{tool.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/tools"
          onClick={() => setOpen(false)}
          className="mt-1 block rounded-lg px-2.5 py-2 text-sm font-medium text-accent-text hover:bg-surface-2"
        >
          View all tools →
        </Link>
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileId = useId();
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile menu after navigation.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
          {PRIMARY.map((tool) => (
            <Link key={tool.id} href={tool.href} aria-current={pathname === tool.href ? "page" : undefined} className={navClass(pathname === tool.href)}>
              {tool.name}
            </Link>
          ))}
          <ToolsMenu pathname={pathname} />
          {PAGES.map((p) => (
            <Link key={p.href} href={p.href} aria-current={pathname === p.href ? "page" : undefined} className={navClass(pathname === p.href)}>
              {p.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls={mobileId}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>
      <nav id={mobileId} aria-label="Mobile" hidden={!mobileOpen} className="border-t border-border bg-bg lg:hidden">
        <ul className="mx-auto grid max-w-7xl gap-0.5 px-4 py-3 sm:grid-cols-2 sm:px-6">
          {allTools.map((tool) => (
            <li key={tool.id}>
              <Link
                href={tool.href}
                aria-current={pathname === tool.href ? "page" : undefined}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-fg hover:bg-surface-2"
              >
                <ToolIcon name={tool.icon} size={16} className="text-accent-text" />
                {tool.name}
              </Link>
            </li>
          ))}
          {PAGES.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="block rounded-lg px-2.5 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg">
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
