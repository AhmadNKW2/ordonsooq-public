"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { ViewAllLink } from "@/components/home/view-all-link";
import { Button } from "@/components/ui";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { SectionHeader } from "./section-header";

type BaseSectionProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  viewAllHref?: string;
  showViewAll?: boolean;
};

type ProductsVariantProps = BaseSectionProps & {
  variant?: "products";
  products: Product[];
  showLoadMore?: boolean;
  showNavArrows?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  initialVisibleCount?: number;
  loadMoreCount?: number;
};

export type HomeSectionProps = ProductsVariantProps;

export function HomeSection(props: HomeSectionProps) {
  const t = useTranslations("common");
  const showViewAll = props.showViewAll ?? true;

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
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
            {isLoading ? t("loading") : t("loadMoreProducts")}
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

// Backwards-compatible export
export const FeaturedProducts = ProductsSection;
