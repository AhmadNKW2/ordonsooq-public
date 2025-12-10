"use client";

import { useState, useRef, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { MegaMenu } from "./mega-menu";
import { useRootCategories } from "@/hooks/useCategories";
import { useLocale, useTranslations } from "next-intl";

export function DesktopNav() {
  const t = useTranslations();
  const locale = useLocale() as 'en' | 'ar';
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch root categories for mega menu
  const { data: categoriesData } = useRootCategories({ limit: 100, visible: true });
  const rootCategories = categoriesData?.data || [];

  // Build dynamic mega menu content
  const MEGA_MENU_CONTENT: Record<string, { title: string; links: { label: string; href: string }[] }[]> = {
    "/categories": rootCategories
      .slice(0, 4)
      .map(category => ({
        title: locale === 'ar' ? category.name_ar : category.name_en,
        links: (category.children || []).slice(0, 5).map(child => ({
          label: locale === 'ar' ? child.name_ar : child.name_en,
          href: `/categories/${child.id}`
        }))
      })),
    "/products": [
      {
        title: t('product.sortBy'),
        links: [
          { label: t('nav.newArrivals'), href: "/products?filter=new" },
          { label: t('product.sale'), href: "/products?filter=sale" },
          { label: t('product.rating'), href: "/products?sort=rating" },
        ]
      },
    ],
  };

  const clearAllTimeouts = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = useCallback((href: string) => {
    clearAllTimeouts();
    
    if (MEGA_MENU_CONTENT[href] && MEGA_MENU_CONTENT[href].length > 0) {
      // Small delay before opening to prevent flickering on fast mouse movements
      openTimeoutRef.current = setTimeout(() => {
        setActiveDropdown(href);
        // Trigger animation after state is set
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      }, 50);
    }
  }, [MEGA_MENU_CONTENT]);

  const handleMouseLeave = useCallback(() => {
    clearAllTimeouts();
    
    closeTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      // Wait for animation to complete before removing from DOM
      setTimeout(() => {
        setActiveDropdown(null);
      }, 150);
    }, 100);
  }, []);

  const handleDropdownMouseEnter = useCallback(() => {
    clearAllTimeouts();
    setIsAnimating(true);
  }, []);

  const handleLinkClick = useCallback(() => {
    clearAllTimeouts();
    setIsAnimating(false);
    setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  }, []);

  return (
    <>
      <nav className="hidden lg:flex items-center gap-1 relative">
        {NAV_LINKS.slice(0, 6).map((link) => (
          <div
            key={link.href}
            className="relative"
            onMouseEnter={() => handleMouseEnter(link.href)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href={link.href}
              className={cn(
                "flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-300 font-medium",
                activeDropdown === link.href && "text-primary bg-primary/5"
              )}
            >
              {link.label}
              {MEGA_MENU_CONTENT[link.href] && (
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  activeDropdown === link.href && "rotate-180"
                )} />
              )}
            </Link>
          </div>
        ))}
      </nav>

      {/* Mega Menu */}
      {activeDropdown && MEGA_MENU_CONTENT[activeDropdown] && (
        <MegaMenu
          content={MEGA_MENU_CONTENT[activeDropdown]}
          isVisible={!!activeDropdown}
          isAnimating={isAnimating}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleMouseLeave}
          onLinkClick={handleLinkClick}
        />
      )}
    </>
  );
}
