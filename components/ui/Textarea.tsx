import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs uppercase tracking-widest text-charcoal font-medium mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          id={id}
          rows={rows}
          ref={ref}
          className={cn(
            "w-full bg-surface border border-charcoal/20 rounded-sm px-4 py-2.5 text-sm text-heading placeholder:text-charcoal/40 transition-colors duration-200 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60 disabled:bg-charcoal/5 resize-y",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
