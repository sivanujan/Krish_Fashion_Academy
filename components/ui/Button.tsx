import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "goldOutline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium tracking-wider uppercase transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:pointer-events-none select-none";

    const variants = {
      primary:
        "bg-gold text-charcoal-darkest hover:bg-gold-light hover:shadow-[0_4px_20px_rgba(201,162,74,0.3)] active:scale-[0.98]",
      secondary:
        "bg-charcoal text-off-white hover:bg-charcoal-darker hover:text-gold-light active:scale-[0.98]",
      outline:
        "border border-charcoal text-charcoal hover:bg-charcoal hover:text-off-white active:scale-[0.98]",
      goldOutline:
        "border border-gold text-gold hover:bg-gold hover:text-charcoal-darkest active:scale-[0.98]",
      ghost:
        "text-charcoal hover:text-gold hover:bg-gold/10 active:scale-[0.98]",
    };

    const sizes = {
      sm: "text-[11px] px-3.5 py-1.5 rounded-sm tracking-[0.15em]",
      md: "text-xs px-5 py-2.5 rounded-sm tracking-[0.2em]",
      lg: "text-sm px-7 py-3.5 rounded-sm tracking-[0.25em]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
