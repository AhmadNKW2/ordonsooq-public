import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "solid" | "outline" | "pill";

type ButtonColorValue = `#${string}` | `var(--${string})`;

function isButtonColorValue(value: unknown): value is ButtonColorValue {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return (
    /^#[0-9a-fA-F]{3,8}$/.test(trimmed) ||
    /^var\(--[a-zA-Z0-9-_]+\)$/.test(trimmed) ||
    /^(rgb|hsl)a?\(/.test(trimmed)
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  /** Visual style variant (defaults to `solid`). */
  variant?: ButtonVariant;
  /** Custom button background color (e.g. `#ffffff` or `var(--color-secondary)`). */
  backgroundColor?: ButtonColorValue;
  /** Custom button text color (e.g. `#ffffff` or `var(--color-secondary)`). */
  textColor?: ButtonColorValue;
}

const sizeClasses = {
  default: "h-11 rounded-lg px-5 py-2",
  sm: "h-9 rounded-md px-3 text-xs",
  lg: "h-12 rounded-lg px-8 text-base",
  xl: "h-14 rounded-xl px-10 text-lg",
  icon: "h-10 w-10 rounded-lg",
};

const variantClasses: Record<ButtonVariant, string> = {
  solid: "bg-primary text-white hover:bg-primary/90 shadow-primary/25",
  outline: "bg-transparent border border-primary text-primary hover:bg-primary/10 shadow-none hover:shadow-none",
  pill: "bg-primary text-white hover:bg-primary/90 shadow-primary/25 rounded-full",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      size = "default",
      variant,
      isLoading,
      backgroundColor,
      textColor,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const resolvedVariant: ButtonVariant = variant ?? "solid";

    const colorStyle: React.CSSProperties = {
      ...(isButtonColorValue(backgroundColor)
        ? {
            backgroundColor,
            ...(resolvedVariant === "outline" ? { borderColor: backgroundColor } : null),
          }
        : null),
      ...(isButtonColorValue(textColor) ? { color: textColor } : null),
      ...(props.style ?? null),
    };
    
    return (
      <button
        className={cn(
          "hover:scale-103 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] shadow-s1 hover:shadow-s1",
          sizeClasses[size],
          variantClasses[resolvedVariant],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        style={colorStyle}
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
