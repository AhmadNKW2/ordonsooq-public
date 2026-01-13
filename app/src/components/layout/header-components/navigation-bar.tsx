"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { useTranslations, useLocale } from "next-intl";
import { useRootCategories } from "@/hooks/useCategories";
import type { Category } from "@/types/api.types";

export function NavigationBar() {
  const t = useTranslations("navigation");
  const navT = useTranslations(); // For top level nav links
  const locale = useLocale();
  const isAr = locale === 'ar';
  
  const { data: categoriesData } = useRootCategories();
  const categories = categoriesData?.data || [];


  // Mega menu content for different nav items
  const MEGA_MENU_CONTENT: Record<string, { title: string; links: { label: string; href: string; description?: string }[] }[]> = useMemo(() => {
    // Dynamic Categories
    const dynamicCategories = categories.slice(0, 4).map((category: Category) => ({
      title: isAr ? category.name_ar : category.name_en,
      links: (category.children || []).slice(0, 5).map((child) => ({
        label: isAr ? child.name_ar : child.name_en,
        href: `/categories/${child.id}`,
        description: "" // Description not available in basic child type
      }))
    }));

    return {
    "/categories": dynamicCategories.length > 0 ? dynamicCategories : [
      // Fallback or Empty state if needed, or keeping structure empty.
      // But user wants dynamic data only.
    ],
    "/products": [
      {
        title: t("shopBy"),
        links: [
          { label: t("newArrivals"), href: "/products?filter=new", description: t("newArrivalsDesc") },
          { label: t("bestSellers"), href: "/products?filter=bestsellers", description: t("bestSellersDesc") },
          { label: t("onSale"), href: "/products?filter=sale", description: t("onSaleDesc") },
          { label: t("topRated"), href: "/products?sort=rating", description: t("topRatedDesc") },
        ]
      },
      {
        title: t("priceRange"),
        links: [
          { label: t("under25"), href: "/products?maxPrice=25", description: t("budgetFriendly") },
          { label: t("range25to50"), href: "/products?minPrice=25&maxPrice=50", description: t("midRange") },
          { label: t("range50to100"), href: "/products?minPrice=50&maxPrice=100", description: t("premiumPicks") },
          { label: t("over100"), href: "/products?minPrice=100", description: t("luxuryItems") },
        ]
      },
    ]
  }}, [t, isAr, categories]);

  const MENU_KEYS = Object.keys(MEGA_MENU_CONTENT);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef = useRef<HTMLElement>(null);
  const navItemsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeouts = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const updateIndicator = useCallback((href: string | null) => {
    if (!href || !navRef.current) {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      return;
    }

    const navItem = navItemsRef.current.get(href);
    if (navItem) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = navItem.getBoundingClientRect();
      setIndicatorStyle({
        left: itemRect.left - navRect.left,
        width: itemRect.width,
        opacity: 1,
      });
    }
  }, []);

  const handleMouseEnter = useCallback((href: string) => {
    clearTimeouts();
    setHoveredLink(href);
    updateIndicator(href);
    
    // Only set activeDropdown if this link has a menu
    if (MEGA_MENU_CONTENT[href]) {
      setActiveDropdown(href);
    } else {
      // Immediately close mega menu when hovering on links without mega menu
      setActiveDropdown(null);
    }
  }, [updateIndicator]);

  const handleMouseLeave = useCallback(() => {
    clearTimeouts();
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setHoveredLink(null);
      updateIndicator(null);
    }, 150);
  }, [updateIndicator]);

  const handleDropdownMouseEnter = useCallback(() => {
    clearTimeouts();
  }, []);

  const handleLinkClick = useCallback(() => {
    clearTimeouts();
    setActiveDropdown(null);
    setHoveredLink(null);
    updateIndicator(null);
  }, [updateIndicator]);

  const isDropdownOpen = activeDropdown !== null && MEGA_MENU_CONTENT[activeDropdown];

  // Keep menu open when mouse is anywhere in the navigation wrapper area
  const handleWrapperMouseEnter = useCallback(() => {
    clearTimeouts();
  }, []);

  // Prevent menu from closing when mouse moves to empty space in container
  const handleContainerMouseEnter = useCallback(() => {
    clearTimeouts();
  }, []);

  return (
    <div 
      className="hidden lg:block bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/50 relative"
      onMouseEnter={handleWrapperMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="container mx-auto px-4"
        onMouseEnter={handleWrapperMouseEnter}
      >
        <nav 
          ref={navRef}
          className="flex items-center justify-center gap-1 py-3 relative"
          onMouseEnter={handleWrapperMouseEnter}
        >
          {/* Animated Background Indicator - smoother with will-change */}
          <div
            className="absolute h-9 bg-white rounded-full shadow-s1 border border-gray-200/50 pointer-events-none will-change-transform"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              opacity: indicatorStyle.opacity,
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />

          {NAV_LINKS.map((link) => (
            <div
              key={link.href}
              ref={(el) => {
                if (el) navItemsRef.current.set(link.href, el);
              }}
              className="relative z-10"
              onMouseEnter={() => handleMouseEnter(link.href)}
            >
              <Link
                href={link.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300",
                  (activeDropdown === link.href || hoveredLink === link.href)
                    ? "text-primary" 
                    : "text-third hover:text-primary"
                )}
              >
                {navT(link.label)}
                {MEGA_MENU_CONTENT[link.href] && (
                  <ChevronDown 
                    className={cn(
                      "w-4 h-4 transition-all",
                      activeDropdown === link.href && "rotate-180"
                    )} 
                  />
                )}
              </Link>
            </div>
          ))}
        </nav>
      </div>

      {/* Dropdown Panel - Single container, content crossfades */}
      <div
        className={cn(
          "absolute left-0 right-0 top-15.4 z-50",
          isDropdownOpen ? "visible" : "invisible"
        )}
        style={{
          opacity: isDropdownOpen ? 1 : 0,
          transform: isDropdownOpen ? "translateY(0) scaleY(1)" : "translateY(-4px) scaleY(0.98)",
          transformOrigin: "top center",
          transition: isDropdownOpen 
            ? "opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), visibility 0s"
            : "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s 0.25s",
          pointerEvents: isDropdownOpen ? "auto" : "none",
        }}
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="bg-white backdrop-blur-xl border-b border-gray-200/50 shadow-2xl shadow-gray-900/5">
          <div className="container mx-auto px-4 py-8 relative">
            {/* Render all menu contents, crossfade between them */}
            {MENU_KEYS.map((menuKey) => (
              <div
                key={menuKey}
                className="transition-all duration-400 ease-out"
                style={{
                  opacity: activeDropdown === menuKey ? 1 : 0,
                  transform: activeDropdown === menuKey ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
                  position: activeDropdown === menuKey ? "relative" : "absolute",
                  top: activeDropdown === menuKey ? "auto" : 0,
                  left: activeDropdown === menuKey ? "auto" : 0,
                  right: activeDropdown === menuKey ? "auto" : 0,
                  visibility: activeDropdown === menuKey ? "visible" : "hidden",
                  transition: "opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.35s",
                }}
              >
                <div 
                  className={cn(
                    "grid gap-8",
                    MEGA_MENU_CONTENT[menuKey].length <= 2 
                      ? "grid-cols-2 max-w-2xl mx-auto" 
                      : "grid-cols-4"
                  )}
                >
                  {MEGA_MENU_CONTENT[menuKey].map((section, idx) => (
                    <div 
                      key={idx}
                      className="transition-all duration-300 ease-out"
                      style={{ 
                        transitionDelay: activeDropdown === menuKey ? `${idx * 40}ms` : "0ms",
                        opacity: activeDropdown === menuKey ? 1 : 0,
                        transform: activeDropdown === menuKey ? "translateY(0)" : "translateY(12px)",
                      }}
                    >
                      <h3 className="text-xs font-semibold text-third uppercase tracking-wider">
                        {section.title}
                      </h3>
                      <ul className="flex flex-col gap-1">
                        {section.links.map((link, linkIdx) => (
                          <li key={linkIdx}>
                            <Link
                              href={link.href}
                              className="group flex items-start gap-3 p-3 -mx-3 rounded-xl hover:bg-gray-50/80 transition-all duration-300"
                              onClick={handleLinkClick}
                            >
                              <div className="flex-1">
                                <span className="block text-primary font-medium group-hover:text-primary transition-colors duration-300">
                                  {link.label}
                                </span>
                                {link.description && (
                                  <span className="block text-sm text-third mt-0.5">
                                    {link.description}
                                  </span>
                                )}
                              </div>
                              <ArrowRight className="w-4 h-4 text-third opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 mt-1" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
