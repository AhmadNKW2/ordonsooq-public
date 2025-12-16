import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white",
        secondary:
          "bg-secondary text-primary",
        success:
          "bg-success/10 text-secondary border border-success/20",
        destructive:
          "bg-danger/10 text-secondary border border-danger/20",
        warning:
          "bg-yellow-100 text-primary border border-yellow-200",
        info:
          "bg-blue-100 text-primary border border-blue-200",
        outline:
          "border border-gray-200 text-primary bg-white",
        new:
          "bg-gradient-to-r from-primary to-primary2 text-white",
        sale:
          "bg-danger text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
