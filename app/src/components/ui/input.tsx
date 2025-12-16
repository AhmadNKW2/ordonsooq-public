import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, icon: Icon, iconPosition = "left", ...props }, ref) => {
    const id = React.useId();
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-primary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-third">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            id={id}
            type={type}
            className={cn(
              "flex h-11 w-full rounded-lg border bg-white px-4 py-2 text-sm transition-all duration-300",
              "placeholder:text-third",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
              error
                ? "border-danger focus:ring-danger"
                : "border-gray-200 hover:border-gray-300",
              Icon && iconPosition === "left" && "pl-10",
              Icon && iconPosition === "right" && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {Icon && iconPosition === "right" && (
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
