"use client";

import { useRef, useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Store, ChevronRight } from "lucide-react";
import { Vendor } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowButton } from "@/components/ui";
import { useTranslations } from "next-intl";

interface VendorsSectionProps {
  vendors: Vendor[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export function VendorsSection({ 
  vendors, 
  title = "Shop by Brand",
  subtitle = "Discover products from trusted vendors",
  showViewAll = true 
}: VendorsSectionProps) {
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

  if (vendors.length === 0) {
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

      {/* Scrollable Vendors */}
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide -mx-4 p-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.slug}`}
              className="group flex flex-col items-center shrink-0"
            >
              {/* Vendor Logo Card */}
              <div className="relative w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-r1 overflow-hidden bg-white border border-gray-100 shadow-s1 group-hover:shadow-s1 group-hover:border-primary/20 transition-all duration-300 group-hover:scale-105 flex items-center justify-center p-4">
                {vendor.logo ? (
                  <Image
                    src={vendor.logo}
                    alt={vendor.name}
                    fill
                    className="object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center rounded-lg">
                    <Store className="w-12 h-12 text-primary/60" />
                  </div>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              {/* Vendor Name */}
              <h3 className="mt-3 text-sm md:text-base font-medium text-gray-700 group-hover:text-primary transition-colors text-center max-w-[140px] line-clamp-2">
                {vendor.name}
              </h3>
              
              {/* Rating */}
              {vendor.rating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-xs text-gray-500">{vendor.rating.toFixed(1)}</span>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Gradient Fades */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-gray-50 to-transparent pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-gray-50 to-transparent pointer-events-none" />
        )}
      </div>

      {/* View All Link */}
      {showViewAll && (
        <div className="text-center mt-6">
          <Link 
            href="/vendors" 
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
