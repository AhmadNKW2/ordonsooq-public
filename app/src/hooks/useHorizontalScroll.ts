import { useRef, useState, useCallback, useEffect } from "react";

export function useHorizontalScroll(scrollAmount = 300) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = useCallback(() => {
    const container = scrollerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  }, []);

  useEffect(() => {
    const container = scrollerRef.current;
    if (!container) return;

    checkScrollButtons();
    container.addEventListener("scroll", checkScrollButtons);
    window.addEventListener("resize", checkScrollButtons);

    return () => {
      container.removeEventListener("scroll", checkScrollButtons);
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, [checkScrollButtons]);

  const scroll = (direction: "left" | "right", amount = scrollAmount) => {
    const container = scrollerRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return {
    scrollerRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft: (amount?: number) => scroll("left", amount),
    scrollRight: (amount?: number) => scroll("right", amount),
  };
}
