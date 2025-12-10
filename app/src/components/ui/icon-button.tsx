"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "ghost" | "outline" | "filled" | "header" | "social";
  /** Any CSS color value (hex, rgb, hsl, css variable, etc.) */
  color?: string;
  isLoading?: boolean;
  /** Badge count for notifications */
  badge?: number;
  /** If true, renders as a link */
  asChild?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  default: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizeClasses = {
  sm: "[&_svg]:w-4 [&_svg]:h-4",
  default: "[&_svg]:w-5 [&_svg]:h-5",
  lg: "[&_svg]:w-6 [&_svg]:h-6",
};

const variantClasses = {
  default: "bg-white/90 hover:bg-white shadow-s1",
  ghost: "bg-transparent hover:bg-black/5",
  outline: "bg-transparent border border-gray-200 hover:bg-gray-50",
  filled: "shadow-s1",
  header: "text-white hover:bg-gray-100 hover:text-primary",
  social: "bg-gray-800 hover:bg-secondary text-gray-300 hover:text-white",
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      size = "default",
      variant = "default",
      color,
      style,
      isLoading,
      disabled,
      badge,
      children,
      ...props
    },
    ref
  ) => {
    // Only apply custom color for default/ghost/outline/filled variants
    const shouldApplyCustomColor = !["header", "social"].includes(variant);
    const effectiveColor = color || (shouldApplyCustomColor ? "var(--color-gray-700)" : undefined);
    
    // Build custom style for colors
    const customStyle: React.CSSProperties = {
      ...style,
      ...(effectiveColor && { "--icon-color": effectiveColor }),
      ...(variant === "filled" && effectiveColor && {
        "--icon-bg": effectiveColor,
        "--icon-color": "#ffffff",
      }),
    } as React.CSSProperties;

    // Determine text color class based on variant
    const colorClass = shouldApplyCustomColor
      ? variant === "filled"
        ? "bg-(--icon-bg) text-(--icon-color) hover:opacity-90"
        : "text-(--icon-color) hover:opacity-80"
      : "";

    return (
      <button
        ref={ref}
        style={customStyle}
        className={cn(
          "relative inline-flex items-center justify-center rounded-lg transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-95",
          sizeClasses[size],
          iconSizeClasses[size],
          variantClasses[variant],
          colorClass,
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin"
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
        ) : (
          children
        )}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton };
