"use client";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** If true, renders as a Link, otherwise just the logo content */
  asLink?: boolean;
  className?: string;
}

export function Logo({ asLink = true, className }: LogoProps) {
  const logoContent = (
    <>
      <div className="flex justify-center items-center bg-white h-9 w-9 rounded-full">
        <div className="h-7 w-7 rounded-full bg-white border-6 border-primary"></div>
      </div>
      <span className="text-2xl text-white inline">rdonsooq</span>
    </>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        className={cn("flex items-center gap-1 font-bold", className)}
        dir="ltr"
      >
        {logoContent}
      </Link>
    );
  }

  return (
    <span className={cn("flex items-center gap-1 font-bold", className)} dir="ltr">
      {logoContent}
    </span>
  );
}
