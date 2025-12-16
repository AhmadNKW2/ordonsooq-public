"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, disabled, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className={cn("checkbox-wrapper inline-flex items-center", className)}>
        <input
          type="checkbox"
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={cn(
            // Base styles
            "relative appearance-none h-5 w-5 shrink-0 rounded-md cursor-pointer",
            "border-2 border-gray-300 bg-white",
            "transition-all duration-200 ease-out",
            // Focus state
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 focus-visible:ring-offset-2",
            // Hover state
            "hover:border-secondary/60 hover:shadow-[0_0_0_4px_rgba(var(--secondary-rgb,99,102,241),0.1)]",
            // Checked state
            "checked:bg-secondary checked:border-secondary",
            // Disabled state
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none",
            // Checkmark - using after pseudo-element
            "after:content-[''] after:block after:absolute",
            "after:left-1.5 after:top-0.5",
            "after:w-[5px] after:h-2.5",
            "after:border-r-2 after:border-b-2 after:border-white",
            "after:opacity-0 after:rotate-45",
            "after:transition-all after:duration-200",
            // Checked checkmark animation
            "checked:after:opacity-100"
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "ml-2.5 text-sm text-primary cursor-pointer select-none",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
