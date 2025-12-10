"use client";

import { useState, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "@/components/products";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  showLoadMore?: boolean;
  showNavArrows?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export function FeaturedProducts({ 
  products, 
  title = "Featured Products",
  subtitle = "Handpicked items just for you",
  viewAllLink = "/products?filter=featured",
  showLoadMore = true,
  showNavArrows = false,
  onLoadMore,
  isLoading = false
}: FeaturedProductsProps) {
  const t = useTranslations('common');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of one card approximately
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth"
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {/* Navigation Arrows */}
          {showNavArrows && products.length > 4 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className={cn(
                  "p-2 rounded-full border border-gray-200 transition-all duration-300",
                  canScrollLeft
                    ? "bg-white hover:bg-gray-50 hover:border-primary text-gray-700 hover:text-primary"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                )}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className={cn(
                  "p-2 rounded-full border border-gray-200 transition-all duration-300",
                  canScrollRight
                    ? "bg-white hover:bg-gray-50 hover:border-primary text-gray-700 hover:text-primary"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                )}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
          <Link 
            href={viewAllLink}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {t('viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Products - Scrollable when showNavArrows, Grid otherwise */}
      {showNavArrows ? (
        <div 
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div key={product.id} className="w-[280px] shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Load More Button - only shown when not using nav arrows */}
      {showLoadMore && !showNavArrows && (
        <div className="flex justify-center pt-10">
          <Button
            color="white"
            size="lg"
            onClick={onLoadMore}
            disabled={isLoading}
            className="min-w-[200px] shadow-s1 rounded-full"
          >
            {isLoading ? "Loading..." : "Load More Products"}
          </Button>
        </div>
      )}
    </section>
  );
}
