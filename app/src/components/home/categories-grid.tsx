"use client";

import { useRef, useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowButton } from "@/components/ui";
import { useTranslations } from "next-intl";

interface CategoriesGridProps {
  categories: Category[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export function CategoriesGrid({
  categories,
  title = "Shop by Category",
  subtitle = "Explore our wide range of categories",
  showViewAll = true
}: CategoriesGridProps) {
  const t = useTranslations('common');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollButtons();
    container.addEventListener("scroll", checkScrollButtons);
    window.addEventListener("resize", checkScrollButtons);

    return () => {
      container.removeEventListener("scroll", checkScrollButtons);
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Scroll Arrows */}
          <ArrowButton
            direction="left"
            variant="carousel"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
          />
          <ArrowButton
            direction="right"
            variant="carousel"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
          />
        </div>
      </div>

      {/* Scrollable Categories */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide -mx-4 p-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center shrink-0"
            >
              {/* Circle Image */}
              <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-s1 group-hover:shadow-s1 group-hover:border-primary/20 transition-all duration-300 group-hover:scale-105">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              </div>

              {/* Category Name */}
              <h3 className="mt-3 text-sm md:text-base font-medium text-gray-700 group-hover:text-primary transition-colors text-center max-w-[120px] line-clamp-2">
                {category.name}
              </h3>

              {/* Product Count */}
              {category.productCount !== undefined && (
                <p className="text-xs text-gray-400 mt-1">
                  {category.productCount} items
                </p>
              )}
            </Link>
          ))}
        </div>

        {/* Gradient Fades */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-4 w-16 bg-linear-to-r from-white to-transparent pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-4 w-16 bg-linear-to-l from-white to-transparent pointer-events-none" />
        )}
      </div>

      {/* View All Link */}
      {showViewAll && (
        <div className="text-center mt-6">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {t('viewAll')}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
