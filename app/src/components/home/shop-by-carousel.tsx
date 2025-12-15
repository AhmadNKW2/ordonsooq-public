"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowButton } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ShopByCarouselProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;

  onScrollLeft?: () => void;
  onScrollRight?: () => void;

  canScrollLeft: boolean;
  canScrollRight: boolean;

  headerRight?: React.ReactNode;

  /** Extra classes applied to the scroll container wrapper. */
  containerClassName?: string;
  /** Extra classes applied to the horizontal scroller element. */
  scrollerClassName?: string;
  /** Optional: change gradient fade color. */
  fadeClassName?: string;
  /** Optional: tweak fade vertical inset (e.g. `bottom-4`). */
  fadePositionClassName?: string;

  /** Optional: pass through arrow colors to ArrowButton. */
  arrowBackgroundColor?: string;
  arrowColor?: string;

  /** Ref for the horizontal scroller element. */
  scrollerRef: React.RefObject<HTMLDivElement | null>;
}

export function ShopByCarousel({
  title,
  subtitle,
  children,
  onScrollLeft,
  onScrollRight,
  canScrollLeft,
  canScrollRight,
  headerRight,
  containerClassName,
  scrollerClassName,
  fadeClassName,
  fadePositionClassName,
  arrowBackgroundColor,
  arrowColor,
  scrollerRef,
}: ShopByCarouselProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle ? <p className="text-gray-500 mt-1">{subtitle}</p> : null}
        </div>
        {headerRight}
      </div>

      <div className={cn("relative group", containerClassName)}>
        <ArrowButton
          direction="left"
          variant="banner"
          size="lg"
          onClick={onScrollLeft}
          disabled={!canScrollLeft}
          showOnHover
          backgroundColor={arrowBackgroundColor}
          arrowColor={arrowColor}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
        />

        <ArrowButton
          direction="right"
          variant="banner"
          size="lg"
          onClick={onScrollRight}
          disabled={!canScrollRight}
          showOnHover
          backgroundColor={arrowBackgroundColor}
          arrowColor={arrowColor}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
        />

        <div
          ref={scrollerRef}
          className={cn(
            "flex gap-6 overflow-x-auto scrollbar-hide -mx-4 p-4 scroll-smooth",
            scrollerClassName
          )}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {children}
        </div>

        {canScrollLeft && (
          <div
            className={cn(
              "absolute left-0 w-16 pointer-events-none",
              fadePositionClassName ?? "top-0 bottom-0",
              fadeClassName ?? "bg-linear-to-r from-gray-50 to-transparent"
            )}
          />
        )}
        {canScrollRight && (
          <div
            className={cn(
              "absolute right-0 w-16 pointer-events-none",
              fadePositionClassName ?? "top-0 bottom-0",
              fadeClassName ?? "bg-linear-to-l from-gray-50 to-transparent"
            )}
          />
        )}
      </div>
    </section>
  );
}

export interface UseCarouselScrollResult {
  scrollerRef: React.RefObject<HTMLDivElement | null>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scrollLeft: () => void;
  scrollRight: () => void;
  checkScrollButtons: () => void;
}

export function useCarouselScroll(scrollAmount = 300): UseCarouselScrollResult {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = React.useCallback(() => {
    const container = scrollerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
  }, []);

  useEffect(() => {
    const container = scrollerRef.current;
    if (!container) return;

    checkScrollButtons();
    container.addEventListener("scroll", checkScrollButtons);
    window.addEventListener("resize", checkScrollButtons);

    return () => {
      container.removeEventListener("scroll", checkScrollButtons);
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, [checkScrollButtons]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollerRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return {
    scrollerRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft: () => scroll("left"),
    scrollRight: () => scroll("right"),
    checkScrollButtons,
  };
}
