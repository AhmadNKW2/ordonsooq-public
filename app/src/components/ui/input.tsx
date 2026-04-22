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
  ({ className, type, error, label, icon: Icon, iconPosition = "left", variant = "default", id: propId, ...props }, ref) => {
    const generatedId = React.useId();
    const id = propId ?? (label ? generatedId : undefined);
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-primary mb-2"
          >
            {label} 
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            type={type}
            className={cn(
              INPUT_STYLES.base,
              INPUT_STYLES.padding,
              "h-11 md:h-11",
              variant === "search" && "rounded-full bg-gray-50 border-gray-200 focus:bg-white ltr:pl-4 ltr:pr-14 rtl:pr-4 rtl:pl-14 md:ltr:pr-16 md:rtl:pl-16",
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
                className="absolute inset-y-0 ltr:right-0 rtl:left-0 flex w-12 md:w-18 items-center justify-center bg-[#F0BB1C] text-white ltr:rounded-r-full ltr:rounded-l-none rtl:rounded-l-full rtl:rounded-r-none hover:brightness-95 transition-[filter]"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
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
