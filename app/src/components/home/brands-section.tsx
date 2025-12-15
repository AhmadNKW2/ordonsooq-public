"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Tag } from "lucide-react";
import { Brand } from "@/types";
import { ViewAllLink } from "@/components/home/view-all-link";
import { ShopByCarousel, useCarouselScroll } from "@/components/home/shop-by-carousel";

interface BrandsSectionProps {
  brands: Brand[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export function BrandsSection({ 
  brands, 
  title = "Shop by Brand",
  subtitle = "Discover products from top brands",
  showViewAll = true 
}: BrandsSectionProps) {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useCarouselScroll(300);

  if (brands.length === 0) {
    return null;
  }

  return (
    <ShopByCarousel
      title={title}
      subtitle={subtitle}
      headerRight={showViewAll ? <ViewAllLink href="/brands" /> : null}
      canScrollLeft={canScrollLeft}
      canScrollRight={canScrollRight}
      onScrollLeft={scrollLeft}
      onScrollRight={scrollRight}
      scrollerRef={scrollerRef}
    >
      {brands.map((brand) => (
        <Link
          key={brand.id}
          href={`/brands/${brand.slug}`}
          className="group/brand flex flex-col items-center shrink-0"
        >
          <div className="relative w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-r1 overflow-hidden bg-white border border-gray-100 shadow-s1 group-hover/brand:shadow-s1 group-hover/brand:border-primary/20 transition-all duration-300 group-hover/brand:scale-105 flex items-center justify-center p-4">
            {brand.logo ? (
              <Image src={brand.logo} alt={brand.name} fill className="object-contain p-4" />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center rounded-lg">
                <Tag className="w-12 h-12 text-primary/60" />
              </div>
            )}
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/brand:opacity-100 transition-opacity duration-300" />
          </div>

          <h3 className="mt-3 text-sm md:text-base font-medium text-gray-700 group-hover/brand:text-primary transition-colors text-center max-w-[140px] line-clamp-2">
            {brand.name}
          </h3>
        </Link>
      ))}
    </ShopByCarousel>
  );
}
