"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  Search, 
  CircleUser, 
  ShoppingCart, 
  Globe, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Trash2,
  Loader2,
  X
} from "lucide-react";

const ICONS = {
  heart: Heart,
  search: Search,
  user: CircleUser,
  cart: ShoppingCart,
  globe: Globe,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  trash: Trash2,
  x: X,
} as const;

export type IconName = keyof typeof ICONS;

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "header" | "social" | "wishlist";
  /** Badge count for notifications */
  badge?: number;
  /** Preset icon to render */
  icon: IconName;
  /** Shape of the button */
  shape?: "square" | "circle";
  /** Active state for toggleable icons (like heart) */
  isActive?: boolean;
  /** Loading state */
  isLoading?: boolean;
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
  default: "bg-white/90 hover:bg-white shadow-s1 text-[var(--color-third)] hover:opacity-80",
  header: "text-white hover:bg-gray-100 hover:text-primary",
  social: "bg-gray-800 hover:bg-secondary text-white hover:text-white",
  wishlist: "shadow-s1 transition-all duration-400",
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      size = "default",
      variant = "default",
      disabled,
      badge,
      icon,
      shape = "square",
      isActive,
      isLoading,
      ...props
    },
    ref
  ) => {
    let effectiveClassName = cn(variantClasses[variant], className);
    let effectiveIconClassName = "";

    if (variant === "wishlist") {
      if (isActive) {
        effectiveClassName = cn(
          variantClasses.wishlist,
          "bg-danger text-white hover:opacity-90",
          className
        );
        effectiveIconClassName = "fill-current transition-all duration-300";
      } else {
        effectiveClassName = cn(
          variantClasses.wishlist,
          "bg-white text-danger hover:bg-danger hover:text-white",
          className
        );
        effectiveIconClassName = "fill-transparent transition-all duration-300";
      }
    }

    const IconComponent = ICONS[icon];

    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center transition-all duration-300",
          shape === "circle" ? "rounded-full" : "rounded-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-95",
          sizeClasses[size],
          iconSizeClasses[size],
          effectiveClassName
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <IconComponent className={effectiveIconClassName} />
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
