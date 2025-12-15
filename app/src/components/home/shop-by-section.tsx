"use client";

import * as React from "react";
import { ShopByCarousel, useCarouselScroll } from "@/components/home/shop-by-carousel";
import { ViewAllLink } from "@/components/home/view-all-link";

export interface ShopBySectionProps<TItem> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;

  items: TItem[];
  renderItem: (item: TItem) => React.ReactNode;

  viewAllHref: string;
  showViewAll?: boolean;

  scrollAmount?: number;

  fadeClassName?: string;
  fadePositionClassName?: string;

  arrowBackgroundColor?: string;
  arrowColor?: string;
}

export function ShopBySection<TItem>({
  title,
  subtitle,
  items,
  renderItem,
  viewAllHref,
  showViewAll = true,
  scrollAmount = 300,
  fadeClassName,
  fadePositionClassName,
  arrowBackgroundColor,
  arrowColor,
}: ShopBySectionProps<TItem>) {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useCarouselScroll(scrollAmount);

  if (items.length === 0) return null;

  return (
    <ShopByCarousel
      title={title}
      subtitle={subtitle}
      headerRight={showViewAll ? <ViewAllLink href={viewAllHref} /> : null}
      canScrollLeft={canScrollLeft}
      canScrollRight={canScrollRight}
      onScrollLeft={scrollLeft}
      onScrollRight={scrollRight}
      scrollerRef={scrollerRef}
      fadeClassName={fadeClassName}
      fadePositionClassName={fadePositionClassName}
      arrowBackgroundColor={arrowBackgroundColor}
      arrowColor={arrowColor}
    >
      {items.map(renderItem)}
    </ShopByCarousel>
  );
}
