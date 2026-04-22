"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface ProductOptionChipProps {
  label: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  href?: string;
  title?: string;
  onClick?: () => void;
  color?: string;
  className?: string;
}

const chipClassName = (selected?: boolean, disabled?: boolean, className?: string) =>
  cn(
    "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all select-none",
    "bg-white",
    selected
      ? "border-secondary bg-secondary/8 text-secondary"
      : "border-gray-200 text-primary hover:border-secondary/60 hover:text-secondary",
    disabled && "cursor-not-allowed opacity-50 hover:border-gray-200 hover:text-primary",
    className,
  );

export function ProductOptionChip({
  label,
  selected = false,
  disabled = false,
  href,
  title,
  onClick,
  color,
  className,
}: ProductOptionChipProps) {
  if (color) {
    const swatchClassName = cn(
      "inline-flex h-8 w-8 rounded-full border ring-2 transition-all relative",
      selected ? "border-white! ring-secondary scale-101" : "border-primary/25 ring-transparent hover:border-white/50 hover:ring-secondary/50 hover:scale-101",
      disabled && "cursor-not-allowed opacity-50 hover:scale-100 hover:ring-transparent hover:border-primary/25",
      className,
    );

    return onClick ? (
      <button
        type="button"
        title={title}
        aria-label={title}
        disabled={disabled}
        onClick={onClick}
        className={swatchClassName}
        style={{ backgroundColor: color }}
      />
    ) : (
      <span title={title} aria-label={title} className={swatchClassName} style={{ backgroundColor: color }} />
    );
  }

  if (selected || disabled || !href) {
    return onClick ? (
      <button
        type="button"
        title={title}
        disabled={disabled}
        onClick={onClick}
        className={chipClassName(selected, disabled, className)}
      >
        {label}
      </button>
    ) : (
      <span title={title} className={chipClassName(selected, disabled, className)}>
        {label}
      </span>
    );
  }

  return (
    <Link href={href} title={title} className={chipClassName(false, false, className)}>
      {label}
    </Link>
  );
}