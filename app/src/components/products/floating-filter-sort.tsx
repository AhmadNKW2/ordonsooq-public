"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FloatingFilterSortProps {
  onSortClick: () => void;
  onFilterClick: () => void;
  activeFiltersCount: number;
  className?: string; // To support external styling/positioning
}

export function FloatingFilterSort({
  onSortClick,
  onFilterClick,
  activeFiltersCount,
  className
}: FloatingFilterSortProps) {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  
  // State to manage visibility based on scroll direction
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Calculate scroll difference
      const scrollDiff = currentScrollY - lastScrollY;
      
      // Basic logic: 
      // - Scrolling down (> 10px): Hide
      // - Scrolling up (< -10px) or near top: Show
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (scrollDiff > 10) {
        setIsVisible(false);
      } else if (scrollDiff < -10) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Add event listener with passive option for performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
           initial={{ y: 20, opacity: 0, x: "-50%" }}
           animate={{ y: 0, opacity: 1, x: "-50%" }}
           exit={{ y: 20, opacity: 0, x: "-50%" }}
           transition={{ 
             type: "tween",
             ease: "easeInOut",
             duration: 0.3
           }}
           className={cn(
             "fixed bottom-20 left-1/2 z-40 lg:hidden flex gap-2", 
             className
           )}
        >
          <div className="bg-secondary/90 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center">
            
            {/* Sort Button */}
            <button
              onClick={onSortClick}
              className="flex items-center gap-1 pr-2 pl-4 py-2 font-medium border-r border-white/20 text-nowrap"
            >
              <span>{t('sortBy')}</span>
              <ArrowUpDown size={16} />
            </button>
            
            {/* Filter Button */}
            <button
              onClick={onFilterClick}
              className="flex items-center gap-1 pl-2 pr-4 py-2 font-medium"
            >
              <span>{tCommon('filters')}</span>
              <Filter size={16} />
              
              {activeFiltersCount > 0 && (
                <span className="bg-white text-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
