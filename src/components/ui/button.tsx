import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 select-none cursor-pointer disabled:opacity-45 disabled:pointer-events-none active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary";

    const variants = {
      primary:
        "bg-brand-accent text-white shadow-[0_10px_30px_-12px_rgba(var(--brand-accent-rgb),0.65)] hover:bg-brand-accentHover hover:shadow-[0_14px_36px_-12px_rgba(var(--brand-accent-rgb),0.75)]",
      secondary:
        "bg-[var(--brand-secondary)] text-theme-title border border-brand-border hover:border-brand-accent/50",
      outline:
        "border border-brand-border text-theme-title hover:border-brand-accent hover:bg-brand-accent/[0.06]",
      ghost:
        "text-theme-muted hover:text-theme-title hover:bg-[var(--brand-secondary)]",
      destructive:
        "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/30",
    };

    const sizes = {
      sm: "h-9 px-3.5 text-[13px] rounded-full gap-1.5",
      md: "h-11 px-5 text-sm rounded-full gap-2",
      lg: "h-14 px-7 text-[15px] rounded-full gap-2.5",
      icon: "h-10 w-10 rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

