import * as React from "react";
import { LucideIcon, Search } from "lucide-react";
import { cn, INPUT_STYLES } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  variant?: "default" | "search";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, icon: Icon, iconPosition = "left", variant = "default", ...props }, ref) => {
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
          <input
            id={id}
            type={type}
            className={cn(
              INPUT_STYLES.base,
              INPUT_STYLES.padding,
              "h-9 md:h-11",
              variant === "search" && "rounded-full bg-gray-50 border-gray-200 focus:bg-white pr-3 md:pr-5",
              error
                ? INPUT_STYLES.error
                : INPUT_STYLES.default,
              Icon && iconPosition === "left" && "pl-8.5",
              Icon && iconPosition === "right" && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {variant === "search" && (
            <button
                type="submit"
                className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                >
                <Search className="w-4 h-4" />
            </button>
          )}
          {Icon && iconPosition === "right" && !variant && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-third">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-secondary">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
