"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { Modal, ArrowButton } from "@/components/ui";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  wishlistButton?: React.ReactNode;
  initialIndex?: number;
}

export function ProductGallery({ images, productName, wishlistButton, initialIndex = 0 }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const handlePrevious = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(-1);
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(1);
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleThumbnailClick = useCallback((index: number) => {
    setDirection(index > selectedIndex ? 1 : -1);
    setSelectedIndex(index);
  }, [selectedIndex]);

  const handleImageClick = useCallback(() => {
    setShowZoomModal(true);
  }, []);

  const handleScroll = useCallback(() => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    setShowScrollUp(container.scrollTop > 0);
    setShowScrollDown(
      container.scrollTop < container.scrollHeight - container.clientHeight - 5
    );
  }, []);

  const scrollThumbnails = useCallback((direction: 'up' | 'down') => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    const scrollAmount = 88; // thumbnail height (80px) + gap (8px)
    const newScrollTop = direction === 'up'
      ? container.scrollTop - scrollAmount
      : container.scrollTop + scrollAmount;

    container.scrollTo({ top: newScrollTop, behavior: 'smooth' });
  }, []);

  // Check scroll position on mount and when images change
  const checkScrollPosition = useCallback(() => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    setShowScrollUp(container.scrollTop > 0);
    setShowScrollDown(
      container.scrollHeight > container.clientHeight &&
      container.scrollTop < container.scrollHeight - container.clientHeight - 5
    );
  }, []);

  // Use effect to check scroll position after render
  useEffect(() => {
    checkScrollPosition();
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(checkScrollPosition, 100);
    return () => clearTimeout(timer);
  }, [images.length, checkScrollPosition]);

  // Update selected index when initialIndex changes (e.g. variant change)
  useEffect(() => {
    setSelectedIndex(initialIndex);
  }, [initialIndex]);

  const slideVariants = useMemo(() => ({
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 60 : -60,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir < 0 ? 60 : -60,
    }),
  }), []);

  const transition: Transition = useMemo(() => ({
    x: { type: "tween" as const, ease: "easeOut", duration: 0.25 },
    opacity: { duration: 0.2 },
  }), []);

  return (
    <>
      <div className="flex gap-2 w-full h-150">
        {/* Thumbnails - Left Side */}
        {images.length > 1 && (
          <div className="relative shrink-0 group h-[600px]">
            {/* Scroll Up Arrow */}
            {showScrollUp && (
              <ArrowButton
                direction="up"
                onClick={() => scrollThumbnails('up')}
                showOnHover
                className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
                aria-label="Scroll up"
              />
            )}

            {/* Thumbnail Container */}
            <div
              ref={thumbnailContainerRef}
              onScroll={handleScroll}
              className="flex flex-col gap-3 h-full overflow-y-auto scrollbar-hide px-2 py-1"
            >
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={cn(
                    "relative w-20 h-20 rounded-lg overflow-hidden transition-all duration-300 shrink-0 ring-2",
                    selectedIndex === index
                      ? "ring-secondary ring-offset-2"
                      : "opacity-60 ring-primary/20 hover:opacity-100 hover:ring-secondary/50"
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
            {showScrollDown && (
              <ArrowButton
                direction="down"
                onClick={() => scrollThumbnails('down')}
                showOnHover
                className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10"
                aria-label="Scroll down"
              />
            )}
          </div>
        )}

        {/* Main Image */}
        <div
          className="relative flex-1 aspect-square bg-gray-50 rounded-r1 overflow-hidden group cursor-zoom-in"
          onClick={handleImageClick}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={selectedIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={images[selectedIndex]}
                alt={`${productName} - Image ${selectedIndex + 1}`}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Wishlist Button - Top Left */}
          {wishlistButton && (
            <div className="absolute top-4 left-4 z-10" onClick={(e) => e.stopPropagation()}>
              {wishlistButton}
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <ArrowButton
                direction="left"
                onClick={handlePrevious}
                showOnHover
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
              />
              <ArrowButton
                direction="right"
                onClick={handleNext}
                showOnHover
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
              />
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white text-sm z-10">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <Modal
        isOpen={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        className="max-w-5xl h-[90vh] bg-transparent shadow-none"
        showCloseButton={true}
        animation="zoom"
        closeButtonClassName="text-primary hover:text-third hover:bg-white/10"
      >
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="relative w-full flex-1">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={selectedIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={images[selectedIndex]}
                  alt={`${productName} - Large View`}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Modal Navigation */}
          {images.length > 1 && (
            <>
              <ArrowButton
                direction="left"
                size="lg"
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50"
              />
              <ArrowButton
                direction="right"
                size="lg"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50"
              />
            </>
          )}

          {/* Thumbnails in Modal */}
          <div className="mt-4 flex gap-2 overflow-x-auto max-w-full px-4 z-50" onClick={(e) => e.stopPropagation()}>
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "relative w-16 h-16 rounded-md overflow-hidden transition-all shrink-0",
                  selectedIndex === index
                    ? "ring-2 ring-white"
                    : "opacity-50 hover:opacity-100"
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
        </div>
      </Modal>
    </>
  );
}
