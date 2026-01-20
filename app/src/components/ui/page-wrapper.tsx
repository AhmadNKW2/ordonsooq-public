import * as React from "react";
import { cn } from "@/lib/utils";

interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageWrapper({ children, className, ...props }: PageWrapperProps) {
  return (
    <div
      className={cn(
        "container mx-auto flex flex-col gap-5 py-10 px-4 md:px-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
