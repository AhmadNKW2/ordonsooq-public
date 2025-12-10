import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  color?: "primary" | "secondary" | "danger" | "success" | "white" | "gray";
}

const sizeClasses = {
  default: "h-11 px-5 py-2",
  sm: "h-9 rounded-md px-3 text-xs",
  lg: "h-12 rounded-lg px-8 text-base",
  xl: "h-14 rounded-xl px-10 text-lg",
  icon: "h-10 w-10",
};

const colorClasses = {
  primary: "bg-primary hover:bg-primary/90 shadow-primary/25",
  secondary: "bg-secondary hover:bg-secondary/80 shadow-secondary/25",
  danger: "bg-danger hover:bg-danger/90 shadow-danger/25",
  success: "bg-success hover:bg-success/90 shadow-success/25",
  white: "bg-white hover:bg-white/90 shadow-gray-200/50 border border-gray-200",
  gray: "bg-gray-100 hover:bg-gray-200 shadow-gray-200/50",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "default", color = "primary", isLoading, children, disabled, ...props }, ref) => {
    const isWhiteOrGray = color === "white" || color === "gray";
    
    return (
      <button
        className={cn(
          "hover:scale-103 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] shadow-s1 hover:shadow-s1",
          sizeClasses[size],
          colorClasses[color],
          isWhiteOrGray ? "text-primary" : "text-white",
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
