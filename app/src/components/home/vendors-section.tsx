"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Store } from "lucide-react";
import { Vendor } from "@/types";
import { ViewAllLink } from "@/components/home/view-all-link";
import { ShopByCarousel, useCarouselScroll } from "@/components/home/shop-by-carousel";

interface VendorsSectionProps {
  vendors: Vendor[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export function VendorsSection({ 
  vendors, 
  title = "Shop by Vendor",
  subtitle = "Discover products from trusted vendors",
  showViewAll = true 
}: VendorsSectionProps) {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useCarouselScroll(300);

  if (vendors.length === 0) {
    return null;
  }

  return (
    <ShopByCarousel
      title={title}
      subtitle={subtitle}
      headerRight={showViewAll ? <ViewAllLink href="/vendors" /> : null}
      canScrollLeft={canScrollLeft}
      canScrollRight={canScrollRight}
      onScrollLeft={scrollLeft}
      onScrollRight={scrollRight}
      scrollerRef={scrollerRef}
    >
      {vendors.map((vendor) => (
        <Link
          key={vendor.id}
          href={`/vendors/${vendor.slug}`}
          className="group/vendor flex flex-col items-center shrink-0"
        >
          <div className="relative w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-r1 overflow-hidden bg-white border border-gray-100 shadow-s1 group-hover/vendor:shadow-s1 group-hover/vendor:border-primary/20 transition-all duration-300 group-hover/vendor:scale-105 flex items-center justify-center p-4">
            {vendor.logo ? (
              <Image src={vendor.logo} alt={vendor.name} fill className="object-contain p-4" />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center rounded-lg">
                <Store className="w-12 h-12 text-primary/60" />
              </div>
            )}
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/vendor:opacity-100 transition-opacity duration-300" />
          </div>

          <h3 className="mt-3 text-sm md:text-base font-medium text-gray-700 group-hover/vendor:text-primary transition-colors text-center max-w-[140px] line-clamp-2">
            {vendor.name}
          </h3>

          {vendor.rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-500">★</span>
              <span className="text-xs text-gray-500">{vendor.rating.toFixed(1)}</span>
            </div>
          )}
        </Link>
      ))}
    </ShopByCarousel>
  );
}
