import * as React from "react";
import { cn, INPUT_STYLES } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, ...props }, ref) => {
    const id = React.useId();
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-primary mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            id={id}
            className={cn(
              INPUT_STYLES.base,
              INPUT_STYLES.padding,
              "min-h-[80px] py-3",
              error ? INPUT_STYLES.error : INPUT_STYLES.default,
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-danger animate-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
