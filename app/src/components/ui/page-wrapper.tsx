import * as React from "react";
import { cn } from "@/lib/utils";

interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageWrapper({ children, className, ...props }: PageWrapperProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 py-6 px-4 md:py-10 md:px-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
