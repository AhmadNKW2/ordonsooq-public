"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ArrowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  direction: "left" | "right" | "up" | "down";
  variant?: "banner" | "carousel" | "gallery";
  size?: "sm" | "default" | "lg";
  /** Show only on parent hover (add group class to parent) */
  showOnHover?: boolean;
}

const sizeClasses = {
  sm: "p-1.5 [&_svg]:w-4 [&_svg]:h-4",
  default: "p-2 [&_svg]:w-7 [&_svg]:h-7",
  lg: "p-3 [&_svg]:w-6 [&_svg]:h-6",
};

const variantClasses = {
  // Banner style: translucent white with backdrop blur, appears on hover
  banner: "bg-white/50 backdrop-blur-sm hover:bg-white shadow-s1 text-gray-800",
  // Carousel style: white with border, hover fills with primary color
  carousel: "bg-white border border-gray-200 hover:bg-primary hover:text-white hover:border-primary shadow-s1",
  // Gallery style: filled with custom color (uses IconButton filled style)
  gallery: "bg-secondary text-white hover:opacity-90 shadow-s1",
};

const disabledClasses = {
  banner: "disabled:opacity-50 disabled:cursor-not-allowed",
  carousel: "disabled:bg-gray-100 disabled:text-gray-300 disabled:border-gray-200 disabled:cursor-not-allowed disabled:shadow-none",
  gallery: "disabled:opacity-50 disabled:cursor-not-allowed",
};

const ArrowButton = React.forwardRef<HTMLButtonElement, ArrowButtonProps>(
  (
    {
      className,
      direction,
      variant = "banner",
      size = "default",
      showOnHover = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const Icon = 
      direction === "left" ? ChevronLeft : 
      direction === "right" ? ChevronRight :
      direction === "up" ? ChevronUp :
      ChevronDown;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "active:scale-95",
          sizeClasses[size],
          variantClasses[variant],
          disabledClasses[variant],
          showOnHover && "opacity-0 group-hover:opacity-100",
          className
        )}
        disabled={disabled}
        aria-label={direction === "left" ? "Previous" : "Next"}
        {...props}
      >
        <Icon />
      </button>
    );
  }
);

ArrowButton.displayName = "ArrowButton";

export { ArrowButton };
