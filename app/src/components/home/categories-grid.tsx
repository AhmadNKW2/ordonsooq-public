"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import { ViewAllLink } from "@/components/home/view-all-link";
import { ShopByCarousel, useCarouselScroll } from "@/components/home/shop-by-carousel";

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
  const { scrollerRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useCarouselScroll(300);

  if (categories.length === 0) {
    return null;
  }

  return (
    <ShopByCarousel
      title={title}
      subtitle={<span className="text-secondary">{subtitle}</span>}
      headerRight={showViewAll ? <ViewAllLink href="/categories" /> : null}
      canScrollLeft={canScrollLeft}
      canScrollRight={canScrollRight}
      onScrollLeft={scrollLeft}
      onScrollRight={scrollRight}
      scrollerRef={scrollerRef}
      fadeClassName="bg-linear-to-r from-white to-transparent"
      fadePositionClassName="top-0 bottom-4"
      arrowBackgroundColor="black/20"
    >
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${category.slug}`}
          className="group/category flex flex-col items-center shrink-0"
        >
          <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-s1 group-hover/category:shadow-s1 group-hover/category:border-primary/20 transition-all duration-300 group-hover/category:scale-105">
            {category.image ? (
              <Image src={category.image} alt={category.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">{category.name.charAt(0)}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/category:opacity-100 transition-opacity duration-300" />
          </div>

          <h3 className="mt-4 text-sm md:text-base font-medium text-gray-700 group-hover/category:text-primary transition-colors text-center max-w-[140px] line-clamp-2">
            {category.name}
          </h3>

          {category.productCount !== undefined && (
            <p className="text-xs text-gray-400 mt-1">{category.productCount} items</p>
          )}
        </Link>
      ))}
    </ShopByCarousel>
  );
}
