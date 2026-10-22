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
      "inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary";

    const variants = {
      primary:
        "bg-brand-accent hover:bg-brand-accentHover text-white shadow-lg shadow-brand-accent/25 hover:shadow-brand-accent/40 border border-brand-accent/30",
      secondary:
        "bg-brand-secondary hover:bg-white/10 text-white border border-brand-border",
      outline:
        "border border-brand-border hover:border-brand-accent text-white hover:bg-brand-accent/10",
      ghost:
        "text-slate-300 hover:text-white hover:bg-white/5",
      destructive:
        "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/30",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs rounded-md gap-1.5",
      md: "h-11 px-5 text-sm rounded-lg gap-2",
      lg: "h-13 px-7 text-base rounded-xl gap-2.5 font-semibold",
      icon: "h-10 w-10 rounded-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
