import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "warning" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-[var(--brand-secondary)] text-theme-title border-brand-border",
    accent: "bg-brand-accent text-white border-brand-accent",
    success: "bg-emerald-500/10 text-emerald-700 border-emerald-600/25",
    warning: "bg-amber-500/10 text-amber-700 border-amber-600/25",
    outline: "bg-transparent text-theme-muted border-brand-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

