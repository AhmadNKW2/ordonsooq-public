"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface ViewAllLinkProps {
  href: string;
  className?: string;
  label?: string;
  icon?: React.ReactNode;
}

export function ViewAllLink({
  href,
  className,
  label,
  icon,
}: ViewAllLinkProps) {
  const t = useTranslations("common");

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-primary hover:text-secondary font-medium transition-all hover:-translate-x-2",
        className
      )}
    >
      {label ?? t("viewAll")}
      {icon ?? <ChevronRight className="w-4 h-4" />}
    </Link>
  );
}
