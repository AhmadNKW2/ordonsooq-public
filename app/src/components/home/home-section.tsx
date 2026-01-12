"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { ViewAllLink } from "@/components/home/view-all-link";
import { ArrowButton, Button } from "@/components/ui";
import { ProductCard } from "@/components/products";
import type { Product } from "@/types";

function useHorizontalScroll(scrollAmount = 300) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = React.useCallback(() => {
    const container = scrollerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
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

  const scroll = (direction: "left" | "right", amount = scrollAmount) => {
    const container = scrollerRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return {
    scrollerRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft: (amount?: number) => scroll("left", amount),
    scrollRight: (amount?: number) => scroll("right", amount),
  };
}

function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary">{title}</h2>
        {subtitle ? <p className="text-secondary mt-1">{subtitle}</p> : null}
      </div>
      {right ? <div className="mt-4 md:mt-0">{right}</div> : null}
    </div>
  );
}

export interface ShopByItem {
  id: string | number;
  href: string;
  name: string;
  image?: string | null;
  isCategory?: boolean;
}

type BaseSectionProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  viewAllHref?: string;
  showViewAll?: boolean;
};

type ShopByVariantProps = BaseSectionProps & {
  variant: "shopBy";
  items: ShopByItem[];
  scrollAmount?: number;
  fadeClassName?: string;
  fadePositionClassName?: string;
  arrowBackgroundColor?: string;
  arrowColor?: string;
  containerClassName?: string;
  scrollerClassName?: string;
};

type ProductsVariantProps = BaseSectionProps & {
  variant: "products";
  products: Product[];
  showLoadMore?: boolean;
  showNavArrows?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  initialVisibleCount?: number;
  loadMoreCount?: number;
};

export type HomeSectionProps = ShopByVariantProps | ProductsVariantProps;

export function HomeSection(props: HomeSectionProps) {
  const showViewAll = props.showViewAll ?? true;

  if (props.variant === "shopBy") {
    const {
      title,
      subtitle,
      items,
      viewAllHref,
      scrollAmount = 300,
      fadeClassName,
      fadePositionClassName,
      arrowBackgroundColor,
      arrowColor,
      containerClassName,
      scrollerClassName,
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

    if (items.length === 0) return null;

    const headerRight = showViewAll && viewAllHref ? (
      <ViewAllLink href={viewAllHref} />
    ) : null;

    return (
      <section>
        <SectionHeader title={title} subtitle={subtitle} right={headerRight} />

        <div className={cn("relative group", containerClassName)}>
          <ArrowButton
            direction="left"
            size="lg"
            onClick={() => scrollLeft()}
            disabled={!canScrollLeft}
            showOnHover
            backgroundColor={resolvedArrowBackgroundColor}
            arrowColor={arrowColor}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
          />

          <ArrowButton
            direction="right"
            size="lg"
            onClick={() => scrollRight()}
            disabled={!canScrollRight}
            showOnHover
            backgroundColor={resolvedArrowBackgroundColor}
            arrowColor={arrowColor}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
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
                <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-s1 group-hover/item:shadow-s1 group-hover/item:border-secondary/50 transition-all duration-300 group-hover/item:scale-103">
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
                      <span className="text-3xl font-bold text-primary">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                </div>

                <h3 className="mt-4 text-sm md:text-base font-medium text-primary group-hover/item:text-secondary transition-colors text-center max-w-35 line-clamp-2">
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

  // products variant
  const {
    title,
    subtitle,
    products,
    viewAllHref,
    showLoadMore = true,
    showNavArrows = false,
    onLoadMore,
    isLoading = false,
    initialVisibleCount = 5,
    loadMoreCount = 5,
  } = props;

  const {
    scrollerRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
  } = useHorizontalScroll(320);

  const [visibleCount, setVisibleCount] = useState(
    Math.min(products.length, Math.max(0, initialVisibleCount))
  );

  useEffect(() => {
    setVisibleCount(Math.min(products.length, Math.max(0, initialVisibleCount)));
  }, [products.length, initialVisibleCount]);

  const visibleProducts = useMemo(() => {
    return showNavArrows
      ? products
      : products.slice(0, Math.max(0, visibleCount));
  }, [products, showNavArrows, visibleCount]);

  const canShowLoadMore =
    showLoadMore && !showNavArrows && visibleCount < products.length;

  if (products.length === 0) return null;

  const headerRight = (
    <div className="flex items-center gap-5">
      {showNavArrows && products.length > 4 ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollLeft()}
            disabled={!canScrollLeft}
            className={cn(
              "p-2 rounded-full border border-gray-200 transition-all duration-300",
              canScrollLeft
                ? "bg-white hover:bg-gray-50 hover:border-primary text-primary hover:text-primary"
                : "bg-gray-100 text-third cursor-not-allowed"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollRight()}
            disabled={!canScrollRight}
            className={cn(
              "p-2 rounded-full border border-gray-200 transition-all duration-300",
              canScrollRight
                ? "bg-white hover:bg-gray-50 hover:border-primary text-primary hover:text-primary"
                : "bg-gray-100 text-third cursor-not-allowed"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ) : null}

      {showViewAll && viewAllHref ? <ViewAllLink href={viewAllHref} /> : null}
    </div>
  );

  return (
    <section>
      <SectionHeader title={title} subtitle={subtitle} right={headerRight} />

      {showNavArrows ? (
        <div
          ref={scrollerRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {visibleProducts.map((product) => (
            <div key={`${product.id}-${product.defaultVariantId ?? "base"}`} className="w-70 shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {visibleProducts.map((product) => (
            <motion.div
              key={`${product.id}-${product.defaultVariantId ?? "base"}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}

      {canShowLoadMore ? (
        <div className="flex justify-center pt-10 pb-5">
          <Button
            variant="pill"
            size="lg"
            onClick={() => {
              setVisibleCount((current) =>
                Math.min(products.length, current + Math.max(0, loadMoreCount))
              );
              onLoadMore?.();
            }}
            disabled={isLoading}
            className="min-w-50 bg-white hover:bg-white/90 shadow-gray-200/50 border border-gray-200 text-primary"
          >
            {isLoading ? "Loading..." : "Load More Products"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export type ProductsSectionProps = Omit<ProductsVariantProps, "variant">;
export function ProductsSection(props: ProductsSectionProps) {
  return (
    <HomeSection
      variant="products"
      {...props}
      viewAllHref={props.viewAllHref ?? "/products?filter=featured"}
      title={props.title ?? "Featured Products"}
      subtitle={props.subtitle ?? "Handpicked items just for you"}
    />
  );
}

export type ShopBySectionProps = Omit<ShopByVariantProps, "variant">;
export function ShopBySection(props: ShopBySectionProps) {
  return <HomeSection variant="shopBy" {...props} />;
}

// Backwards-compatible export
export const FeaturedProducts = ProductsSection;
