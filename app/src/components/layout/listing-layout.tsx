"use client";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface ListingLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href: string }[];
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  heroContent?: React.ReactNode;
  className?: string; // Additional classes for the container
}

export function ListingLayout({
  children,
  breadcrumbs,
  title,
  subtitle,
  heroContent,
  className,
}: ListingLayoutProps) {
  return (
    <div className={cn("container mx-auto", className)}>
      {breadcrumbs && (
        <div className="mb-6">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}
      
      {heroContent}

      {/* Show Title/Subtitle only if no heroContent is provided */}
      {(title && !heroContent) && (
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
           {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
        </div>
      )}

      {children}
    </div>
  );
}
