"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** If true, renders as a Link, otherwise just the logo content */
  asLink?: boolean;
  className?: string;
}

export function Logo({ asLink = true, className }: LogoProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const logoSrc = isArabic ? "/SVG/Logo%20AR.svg" : "/SVG/Logo%20EN.svg";

  const logoContent = (
    <Image
      src={logoSrc}
      alt="ordonsooq"
      width={isArabic ? 649 : 853}
      height={isArabic ? 238 : 176}
      priority
      className="h-9 md:h-11                                                                                                                                                                                                                                                                                                                                                           w-auto"
    />
  );

  if (asLink) {
    return (
      <Link
        href="/"
        className={cn("inline-flex items-center shrink-0", className)}
      >
        {logoContent}
      </Link>
    );
  }

  return (
    <span className={cn("inline-flex items-center shrink-0", className)}>
      {logoContent}
    </span>
  );
}
