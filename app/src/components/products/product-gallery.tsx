"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  wishlistButton?: React.ReactNode;
  initialIndex?: number;
  showThumbnails?: boolean;
  showMainImage?: boolean;
  selectedIndex?: number;
  onIndexChange?: (index: number) => void;
}

export function ProductGallery({
  images,
  productName,
  wishlistButton,
  initialIndex = 0,
  showThumbnails = true,
  showMainImage = true,
  selectedIndex: controlledIndex,
  onIndexChange
}: ProductGalleryProps) {
  const [internalIndex, setInternalIndex] = useState(initialIndex);
  const selectedIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const setSelectedIndex = useCallback((index: number | ((prev: number) => number)) => {
    if (onIndexChange) {
      if (typeof index === 'function') {
        const next = index(selectedIndex);
        onIndexChange(next);
      } else {
        onIndexChange(index);
      }
    } else {
      setInternalIndex(index);
    }
  }, [onIndexChange, selectedIndex]);

  const [showZoomModal, setShowZoomModal] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [thumbnailSize, setThumbnailSize] = useState<number | null>(null);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const container = thumbnailContainerRef.current;
    if (!container || !showMainImage) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const isMobile = window.innerWidth < 768;
        
        let availableSpace = isMobile ? entry.contentRect.width : entry.contentRect.height;
        if (availableSpace <= 0) continue;

        const idealSize = 64; 
        const gap = isMobile ? 12 : 16;
        
        let count = Math.round((availableSpace + gap) / (idealSize + gap));
        if (count < 1) count = 1;

        availableSpace = availableSpace - (isMobile ? 16 : 16); // padding p-2 is 8px each side
        const exactSize = (availableSpace - (count - 1) * gap) / count;
        setThumbnailSize(exactSize);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [showMainImage]);

  const handlePrevious = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();

    setDirection('right');
    setIsAnimating(true);
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      setDirection(null);
    }, 500);
  }, [images.length, isAnimating]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();

    setDirection('left');
    setIsAnimating(true);
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      setDirection(null);
    }, 500);
  }, [images.length, isAnimating]);

  const handleThumbnailClick = useCallback((index: number) => {
    if (index === selectedIndex) return;

    setDirection(index > selectedIndex ? 'left' : 'right');
    setIsAnimating(true);
    setSelectedIndex(index);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      setDirection(null);
    }, 500);
  }, [selectedIndex, isAnimating]);

  const handleImageClick = useCallback(() => {
    setShowZoomModal(true);
  }, []);

  // Touch handling for swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };

  const handleScroll = useCallback(() => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    setShowScrollUp(container.scrollTop > 0);
    setShowScrollDown(
      container.scrollTop < container.scrollHeight - container.clientHeight - 5
    );
  }, []);

  const scrollThumbnails = useCallback((scrollDirection: 'up' | 'down') => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    // Dynamically calculate the scroll amount based on single thumbnail size + gap
    const firstChild = container.children[0] as HTMLElement;
    const itemHeight = firstChild ? firstChild.getBoundingClientRect().height : 64;
    const gap = 16;
    const scrollAmount = itemHeight + gap;
    
    // Snap to nearest item
    let currentItemIndex = Math.round(container.scrollTop / scrollAmount);
    let newIndex = scrollDirection === 'up' ? currentItemIndex - 1 : currentItemIndex + 1;
    let newScrollTop = newIndex * scrollAmount;
    newScrollTop = Math.max(0, Math.min(newScrollTop, container.scrollHeight - container.clientHeight));
    container.scrollTo({ top: newScrollTop, behavior: 'smooth' });
  }, []);

  const checkScrollPosition = useCallback(() => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    setShowScrollUp(container.scrollTop > 0);
    setShowScrollDown(
      container.scrollHeight > container.clientHeight &&
      container.scrollTop < container.scrollHeight - container.clientHeight - 5
    );
  }, []);

  useEffect(() => {
    checkScrollPosition();
    const timer = setTimeout(checkScrollPosition, 100);
    return () => clearTimeout(timer);
  }, [images.length, checkScrollPosition]);

  useEffect(() => {
    setSelectedIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className={cn(
        "relative",
        // Mobile: Flex to control order easily. Desktop: Grid to strongly constrain heights
        showThumbnails && showMainImage ? "flex flex-col md:grid md:grid-cols-[4.5rem_1fr] lg:grid-cols-[5rem_1fr] gap-4 md:gap-6" : "block"
      )}
      >
        {/* Thumbnails (Left side on Desktop, Bottom on Mobile) */}
        {showThumbnails && images.length > 1 && (
          <div className={cn(
            "relative group shrink-0",
            // Desktop: Side bar strict height constraint (h-0 min-h-full forces it to match sibling height)
            showMainImage && "md:h-0 md:min-h-full md:w-full",
            // Mobile: Row below image
            showMainImage && "w-full h-20 order-2 md:order-none"
          )}>
            {/* Desktop Inner Wrapper for position absolute to strictly contain overflow within the grid row */}
            <div className={cn(
              "w-full h-full",
              showMainImage && "md:absolute md:inset-0"
            )}>
              {/* Scroll Up Arrow */}
              {showScrollUp && showMainImage && (
                <button
                  onClick={() => scrollThumbnails('up')}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md transition-all duration-300 flex items-center justify-center hover:bg-gray-50 text-gray-600 hover:text-primary md:flex hidden"
                  aria-label="Scroll up"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              )}

              {/* Thumbnail Container */}
              <div
                ref={thumbnailContainerRef}
                onScroll={handleScroll}
                className={cn(
                  "overflow-y-auto scrollbar-hide flex",
                  // padding is vital to give the focus rings room so they aren't masked by flex container bounds
                  showMainImage && "p-2 mx-1",
                  // Desktop: Vertical column
                  showMainImage ? "md:flex-col md:gap-4 md:h-full md:items-center" : "",
                  // Mobile: Horizontal row
                  showMainImage ? "flex-row gap-3 overflow-x-auto w-full h-full" : "",
                  // Standalone thumbnails
                  !showMainImage && "flex-row gap-2 overflow-x-auto w-full",
                )}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    style={thumbnailSize && showMainImage ? { width: thumbnailSize, height: thumbnailSize } : undefined}
                    className={cn(
                      "relative rounded-lg overflow-hidden shrink-0 ring-2 transition-all duration-300",
                      // Desktop size
                      showMainImage ? "md:w-16 md:h-16 lg:w-16 lg:h-16" : "w-16 h-16",
                      // Mobile size
                      showMainImage ? "w-16 h-16" : "",
                      selectedIndex === index
                        ? "ring-primary ring-offset-2 opacity-100 scale-105"
                        : "opacity-60 ring-gray-200 hover:opacity-100 hover:ring-primary/50 hover:scale-105"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${productName} - Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Scroll Down Arrow */}
              {showScrollDown && showMainImage && (
                <button
                  onClick={() => scrollThumbnails('down')}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md transition-all duration-300 flex items-center justify-center hover:bg-gray-50 text-gray-600 hover:text-primary md:flex hidden"
                  aria-label="Scroll down"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Image */}
        {showMainImage && (
        <div
          className={cn(
            "relative w-full aspect-square rounded-3xl bg-gray-50 overflow-hidden group cursor-zoom-in border border-secondary/20",
            // Mobile: Main Image FIRST (order-1)
            "order-1 md:order-none"
          )}
          onClick={handleImageClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Image Container with Animation */}
          <div className="relative w-full h-full">
            {images.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 w-full h-full transition-all duration-500 ease-in-out",
                  selectedIndex === index && !direction && "opacity-100 translate-x-0 scale-100",
                  selectedIndex === index && direction === 'left' && "opacity-100 translate-x-0 scale-100 animate-slide-in-left",
                  selectedIndex === index && direction === 'right' && "opacity-100 translate-x-0 scale-100 animate-slide-in-right",
                  selectedIndex !== index && direction === 'left' && "opacity-0 -translate-x-full scale-95",
                  selectedIndex !== index && direction === 'right' && "opacity-0 translate-x-full scale-95",
                  selectedIndex !== index && !direction && index < selectedIndex && "opacity-0 -translate-x-full scale-95",
                  selectedIndex !== index && !direction && direction === 'right' && "opacity-0 translate-x-full scale-95",
                  selectedIndex !== index && !direction && index < selectedIndex && "opacity-0 -translate-x-full scale-95",
                  selectedIndex !== index && !direction && index > selectedIndex && "opacity-0 translate-x-full scale-95"
                )}
                style={{
                  zIndex: selectedIndex === index ? 1 : 0,
                }}
              >
                <Image
                  src={image}
                  alt={`${productName} - Image ${index + 1}`}
                  fill
                  className="object-cover object-top"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Wishlist Button - Top Right */}
          {wishlistButton && (
            <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
              {wishlistButton}
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                disabled={isAnimating}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:bg-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                disabled={isAnimating}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:bg-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm z-10 transition-opacity duration-300">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
        )}
      </div>

      {/* Zoom Modal */}
      {showZoomModal && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowZoomModal(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowZoomModal(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 flex items-center justify-center text-white hover:scale-110"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative w-full h-full max-w-6xl flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* Main Image Container */}
            <div className="relative w-full flex-1 overflow-hidden rounded-lg border border-secondary/50">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    "absolute inset-0 w-full h-full transition-all duration-500 ease-in-out",
                    selectedIndex === index && !direction && "opacity-100 translate-x-0 scale-100",
                    selectedIndex === index && direction === 'left' && "opacity-100 translate-x-0 scale-100 animate-slide-in-left",
                    selectedIndex === index && direction === 'right' && "opacity-100 translate-x-0 scale-100 animate-slide-in-right",
                    selectedIndex !== index && index < selectedIndex && "opacity-0 -translate-x-full scale-95",
                    selectedIndex !== index && index > selectedIndex && "opacity-0 translate-x-full scale-95"
                  )}
                  style={{
                    zIndex: selectedIndex === index ? 1 : 0,
                  }}
                >
                  <Image
                    src={image}
                    alt={`${productName} - Large View`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ))}
            </div>

            {/* Modal Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  disabled={isAnimating}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 flex items-center justify-center text-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  disabled={isAnimating}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 flex items-center justify-center text-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Thumbnails in Modal */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto max-w-full px-4 py-2 z-50 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={cn(
                      "relative w-16 h-16 rounded-md overflow-hidden transition-all duration-300 shrink-0",
                      selectedIndex === index
                        ? "ring-2 ring-white opacity-100 scale-110"
                        : "opacity-50 hover:opacity-100 hover:scale-105"
                    )}
                  >
                    <Image
                      src={image}
                      alt="Thumbnail"
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(-100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}