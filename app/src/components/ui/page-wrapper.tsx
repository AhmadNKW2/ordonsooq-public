import * as React from "react";
import { cn } from "@/lib/utils";

interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageWrapper({ children, className, ...props }: PageWrapperProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 py-5 px-5 md:py-5 md:px-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
