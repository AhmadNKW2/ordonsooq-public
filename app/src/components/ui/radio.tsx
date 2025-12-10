"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  variant?: "default" | "tag";
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, disabled, variant = "default", ...props }, ref) => {
    const inputId = id || React.useId();

    if (variant === "tag") {
      return (
        <div className={cn("relative inline-block", className)}>
          <input
            type="radio"
            id={inputId}
            ref={ref}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              "inline-block py-3 px-5 rounded-full cursor-pointer transition-all duration-200 ease-out select-none",
              "bg-white shadow-sm ring-1 ring-inset ring-gray-200",
              "hover:bg-gray-50 hover:ring-gray-300",
              "peer-focus:outline-none peer-focus-visible:ring-2 peer-checked:text-secondary peer-checked:font-semibold peer-focus-visible:ring-secondary/30 peer-focus-visible:ring-offset-2",
              "peer-checked:ring-2 peer-checked:ring-secondary peer-checked:hover:ring-secondary peer-checked:shadow-[0_1px_2px_1px_rgba(0,0,0,0.1)]",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-disabled:hover:bg-white peer-disabled:hover:ring-gray-200"
            )}
          >
            {label}
          </label>
        </div>
      );
    }

    return (
      <div className={cn("radio-wrapper inline-flex items-center", className)}>
        <div className="relative flex items-center justify-center shrink-0">
          <input
            type="radio"
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styles
              "peer relative appearance-none h-5 w-5 rounded-full cursor-pointer",
              "border-2 border-gray-300 bg-white",
              "transition-all duration-200 ease-out",
              // Focus state
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 focus-visible:ring-offset-2",
              // Hover state
              "hover:border-secondary/60 hover:shadow-[0_0_0_4px_rgba(var(--secondary-rgb,99,102,241),0.1)]",
              // Checked state
              "checked:border-secondary checked:bg-secondary",
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
            )}
            {...props}
          />
          {/* Inner dot */}
          <div 
            className={cn(
              "absolute pointer-events-none",
              "h-2 w-2 rounded-full bg-white",
              "scale-0 opacity-0",
              "transition-all duration-200 ease-out",
              "peer-checked:scale-100 peer-checked:opacity-100"
            )}
          />
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "ml-2.5 text-sm text-gray-700 cursor-pointer select-none",
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

Radio.displayName = "Radio";

export { Radio };
