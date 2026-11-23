import type { ReactNode } from "react";

interface PanelProps {
  title: ReactNode;
  titleId?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

/** Bordered card with a header row, used for every editor and result area. */
export function Panel({ title, titleId, actions, children, className = "", footer }: PanelProps) {
  return (
    <section
      aria-labelledby={titleId}
      className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card ${className}`}
    >
      <header className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-2 px-3 py-1.5">
        {typeof title === "string" ? (
          <h2 id={titleId} className="text-[13px] font-semibold tracking-wide text-fg uppercase">
            {title}
          </h2>
        ) : (
          <div id={titleId}>{title}</div>
        )}
        {actions && <div className="flex flex-wrap items-center gap-1">{actions}</div>}
      </header>
      {children}
      {footer}
    </section>
  );
}
