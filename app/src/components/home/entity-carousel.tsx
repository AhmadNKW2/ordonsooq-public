"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

import { cn } from "@/lib/utils";
import { ViewAllLink } from "@/components/home/view-all-link";
import { ArrowButton } from "@/components/ui";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { SectionHeader } from "./section-header";

export interface EntityCarouselItem {
  id: string | number;
  href: string;
  name: string;
  image?: string | null;
  isCategory?: boolean;
}

export type EntityCarouselProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  viewAllHref?: string;
  showViewAll?: boolean;
  items: EntityCarouselItem[];
  scrollAmount?: number;
  fadeClassName?: string;
  fadePositionClassName?: string;
  arrowBackgroundColor?: string;
  arrowColor?: string;
  containerClassName?: string;
  scrollerClassName?: string;
  layoutVariant?: 'default' | 'compact';
};

export function EntityCarousel(props: EntityCarouselProps) {
  const {
    title,
    subtitle,
    items,
    viewAllHref,
    showViewAll = true,
    scrollAmount = 300,
    fadeClassName,
    fadePositionClassName,
    arrowBackgroundColor,
    arrowColor,
    containerClassName,
    scrollerClassName,
    layoutVariant = 'default',
  } = props;

  const {
    scrollerRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
  } = useHorizontalScroll(scrollAmount);

  const resolvedArrowBackgroundColor = arrowBackgroundColor ?? "black/20";
  const resolvedFadeClassName =
    fadeClassName ?? "bg-linear-to-r from-white to-transparent";
  const resolvedFadePositionClassName = fadePositionClassName ?? "top-0 bottom-4";

  const isCompact = layoutVariant === 'compact';
  const imageSizeClasses = isCompact 
    ? "w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24" 
    : "w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32";

  if (items.length === 0) return null;

  const headerRight = showViewAll && viewAllHref ? (
    <ViewAllLink href={viewAllHref} />
  ) : null;

  return (
    <section>
      {(!isCompact || title) && <SectionHeader title={title} subtitle={subtitle} right={headerRight} />}

      <div className={cn("relative group", containerClassName)}>
        <ArrowButton
          direction="left"
          size="lg"
          onClick={() => scrollLeft()}
          disabled={!canScrollLeft}
          showOnHover
          backgroundColor={resolvedArrowBackgroundColor}
          arrowColor={arrowColor}
          className="absolute -left-1 top-1/2 -translate-y-1/2 z-20"
        />

        <ArrowButton
          direction="right"
          size="lg"
          onClick={() => scrollRight()}
          disabled={!canScrollRight}
          showOnHover
          backgroundColor={resolvedArrowBackgroundColor}
          arrowColor={arrowColor}
          className="absolute -right-1 top-1/2 -translate-y-1/2 z-20"
        />

        <div
          ref={scrollerRef}
          className={cn(
            "flex gap-5 overflow-x-auto scrollbar-hide -mx-4 p-4 scroll-smooth",
            scrollerClassName
          )}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group/item flex flex-col items-center shrink-0"
            >
              <div className={cn(
                "relative rounded-full overflow-hidden border-4 border-white shadow-s1 group-hover/item:shadow-s1 group-hover/item:border-secondary/50 transition-all duration-300 group-hover/item:scale-103",
                imageSizeClasses
              )}>
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className={
                      item.isCategory
                        ? "object-cover"
                        : "object-contain p-1"
                    }
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className={cn(
                      "font-bold text-primary",
                      isCompact ? "text-xl" : "text-3xl"
                    )}>
                      {item.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
              </div>

              <h3 className={cn(
                "mt-4 font-medium text-primary group-hover/item:text-secondary transition-colors text-center max-w-35 line-clamp-2",
                isCompact ? "text-xs md:text-sm" : "text-sm md:text-base"
              )}>
                {item.name}
              </h3>
            </Link>
          ))}
        </div>

        {canScrollLeft && (
          <div
            className={cn(
              "absolute left-0 w-16 pointer-events-none",
              resolvedFadePositionClassName,
              resolvedFadeClassName
            )}
          />
        )}
        {canScrollRight && (
          <div
            className={cn(
              "absolute right-0 w-16 pointer-events-none",
              resolvedFadePositionClassName,
              resolvedFadeClassName.replace(
                "bg-linear-to-r from-",
                "bg-linear-to-l from-"
              )
            )}
          />
        )}
      </div>
    </section>
  );
}
