import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover shadow-card border border-transparent",
  secondary: "bg-surface text-fg border border-border hover:border-border-strong hover:bg-surface-2 shadow-card",
  ghost: "text-muted hover:text-fg hover:bg-surface-2 border border-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-2.5 text-[13px]",
  md: "h-9 gap-2 px-3.5 text-sm",
};

export function Button({ variant = "secondary", size = "md", icon, className = "", children, type, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
