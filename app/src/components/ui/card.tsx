import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-r1 border border-gray-100 bg-white shadow-s1 transition-all duration-300 p-5",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
