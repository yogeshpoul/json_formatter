import Link from "next/link";
import { siteConfig } from "@/config/site";

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden focusable="false">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path
        d="M12.5 9.5c-2 0-3 1-3 3v1.6c0 1.1-.6 1.9-1.7 1.9 1.1 0 1.7.8 1.7 1.9v1.6c0 2 1 3 3 3M19.5 9.5c2 0 3 1 3 3v1.6c0 1.1.6 1.9 1.7 1.9-1.1 0-1.7.8-1.7 1.9v1.6c0 2-1 3-3 3"
        fill="none"
        stroke="var(--accent-fg)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="1.6" fill="var(--accent-fg)" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-md font-semibold tracking-tight text-fg" aria-label={`${siteConfig.name} home`}>
      <LogoMark />
      <span className="text-[17px]">{siteConfig.name}</span>
    </Link>
  );
}
