"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Banner } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowButton } from "@/components/ui";

interface HeroBannerProps {
  banners: Banner[];
  autoPlay?: boolean;
  interval?: number;
}

export function HeroBanner({
  banners,
  autoPlay = true,
  interval = 5000
}: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter only active banners
  const activeBanners = banners.filter(banner => banner.isActive);

  const goToSlide = useCallback((index: number, force = false) => {
    if ((!force && isTransitioning) || index === currentIndex) return;

    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    setIsTransitioning(true);
    setCurrentIndex(index);
    setProgressKey(prev => prev + 1); // Reset progress bar

    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [currentIndex, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    const newIndex = currentIndex === 0 ? activeBanners.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, activeBanners.length, isTransitioning, goToSlide]);

  const goToNext = useCallback((force = false) => {
    if (!force && isTransitioning) return;
    const newIndex = currentIndex === activeBanners.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex, force);
  }, [currentIndex, activeBanners.length, isTransitioning, goToSlide]);

  // Auto play - use setTimeout for more precise control
  useEffect(() => {
    if (!autoPlay || activeBanners.length <= 1) return;

    const timer = setTimeout(() => {
      goToNext(true); // Force transition for autoplay
    }, interval);

    return () => clearTimeout(timer);
  }, [autoPlay, activeBanners.length, interval, currentIndex, progressKey]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex];

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[550px] rounded-2xl overflow-hidden group">
      {/* Banner Slides */}
      {activeBanners.map((banner, index) => (
        <div
          key={banner.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-500 ease-in-out",
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          {/* Background Image */}
          <Image
            src={banner.image}
            alt={banner.title || `Banner ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />

          {/* Link Overlay */}
          {banner.link && (
            <Link
              href={banner.link}
              className="absolute inset-0 z-10"
              aria-label={banner.title || "Banner link"}
              target="_blank"

            />
          )}

          {/* Overlay
          <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/30 to-transparent" /> */}

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4 md:px-8">
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <ArrowButton
            direction="left"
            size="lg"
            onClick={goToPrevious}
            disabled={isTransitioning}
            showOnHover
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
          />

          <ArrowButton
            direction="right"
            size="lg"
            onClick={() => goToNext()}
            disabled={isTransitioning}
            showOnHover
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
          />
        </>
      )}

      {/* Dot Indicators */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                "disabled:cursor-not-allowed",
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 backdrop-blur-sm hover:bg-white/80"
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? "true" : "false"}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {autoPlay && activeBanners.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 z-20">
          <div
            key={progressKey}
            className="h-full bg-secondary"
            style={{
              animation: `progress ${interval}ms linear forwards`,
            }}
          />
          <style jsx>{`
            @keyframes progress {
              from { width: 0%; }
              to { width: 100%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
