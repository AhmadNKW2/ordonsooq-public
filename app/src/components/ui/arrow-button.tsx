"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ArrowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  direction: "left" | "right" | "up" | "down";
  variant?: "banner" | "gallery";
  size?: "sm" | "default" | "lg";
  /** Show only on parent hover (add group class to parent) */
  showOnHover?: boolean;
  /**
   * Optional raw CSS color value for background.
   * Supports plain CSS colors (e.g. "#fff", "rgba(0,0,0,0.8)", "var(--color-primary)")
   * and Tailwind-like alpha suffix (e.g. "black/80", "var(--color-primary)/12").
   */
  backgroundColor?: string;
  /** Optional raw CSS color value for arrow/icon color (e.g. "#111" or "var(--color-secondary)") */
  arrowColor?: string;
}

function resolveCssColorWithOptionalAlpha(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // If user already passed a functional CSS color (rgb()/hsl()/etc), don't try to parse our own slash syntax.
  if (/(^|\s)(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\(/i.test(trimmed)) {
    return trimmed;
  }

  // Support Tailwind-like "color/alpha" (e.g. black/80, var(--x)/12, #000/50)
  const slashIndex = trimmed.lastIndexOf("/");
  if (slashIndex <= 0) return trimmed;

  const base = trimmed.slice(0, slashIndex).trim();
  const alphaRaw = trimmed.slice(slashIndex + 1).trim();
  if (!base || !alphaRaw) return trimmed;

  let alphaPercent: string | null = null;
  if (alphaRaw.endsWith("%")) {
    alphaPercent = alphaRaw;
  } else {
    const numeric = Number(alphaRaw);
    if (!Number.isFinite(numeric)) return trimmed;
    alphaPercent = numeric <= 1 ? `${numeric * 100}%` : `${numeric}%`;
  }

  // color-mix supports named colors, hex, and CSS variables in modern browsers.
  return `color-mix(in srgb, ${base} ${alphaPercent}, transparent)`;
}

const sizeClasses = {
  sm: "p-1.5 [&_svg]:w-4 [&_svg]:h-4",
  default: "p-2 [&_svg]:w-7 [&_svg]:h-7",
  lg: "p-3 [&_svg]:w-6 [&_svg]:h-6",
};

const variantClasses = {
  // Banner style: translucent white with backdrop blur, appears on hover
  banner: "bg-white/50 backdrop-blur-sm hover:bg-white shadow-s1 text-gray-800",
  // Gallery style: filled with custom color (uses IconButton filled style)
  gallery: "bg-secondary text-white hover:opacity-90 shadow-s1",
};

const disabledClasses = {
  banner: "disabled:opacity-50 disabled:cursor-not-allowed",
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
      backgroundColor,
      arrowColor,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const resolvedBackgroundColor = resolveCssColorWithOptionalAlpha(backgroundColor);
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
          showOnHover &&
            "opacity-0 group-hover:opacity-100 disabled:opacity-0 group-hover:disabled:opacity-50",
          className
        )}
        style={{
          ...style,
          ...(resolvedBackgroundColor ? { backgroundColor: resolvedBackgroundColor } : null),
          ...(arrowColor ? { color: arrowColor } : null),
        }}
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
