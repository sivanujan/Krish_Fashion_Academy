import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "gold" | "success" | "danger" | "neutral" | "outline";
}

export function Badge({
  className,
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    gold: "bg-gold/15 text-gold-dark border border-gold/30",
    success: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
    danger: "bg-rose-500/10 text-rose-700 border border-rose-500/20",
    neutral: "bg-charcoal/10 text-charcoal border border-charcoal/15",
    outline: "border border-charcoal/30 text-charcoal-light",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
