"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BELOW_50_JOD_MAX_PRICE } from "@/lib/constants";
import { useTranslations, useLocale } from "next-intl";
import { useHome } from "@/hooks/useHome";
import type { Category, HomeCategory } from "@/types/api.types";

type MegaMenuLink = {
  label: string;
  href: string;
  description?: string;
};

type MegaMenuSection = {
  title: string;
  href?: string;
  links: MegaMenuLink[];
};

type NavigationLink = {
  key: string;
  label: string;
  href: string;
  menu?: MegaMenuSection[];
};

export function NavigationBar() {
  const navT = useTranslations("nav");
  const locale = useLocale();
  const isAr = locale === "ar";
  const { data: homeData } = useHome();
  const categories = homeData?.categories || [];

  const navigationLinks = useMemo<NavigationLink[]>(() => {
    const getCategoryLabel = (category: Pick<HomeCategory | Category, "name_ar" | "name_en" | "slug">) => (
      (isAr ? category.name_ar : category.name_en)
      || (isAr ? category.name_en : category.name_ar)
      || category.slug
    );

    const categoryLinks = categories
      .filter((category) => Boolean(category.slug))
      .map((category: HomeCategory | Category) => {
        const categoryHref = `/categories/${category.slug}`;
        const label = getCategoryLabel(category);
        const childLinks = (category.children || [])
          .filter((child) => Boolean(child.slug))
          .map((child) => ({
            label: getCategoryLabel(child as HomeCategory | Category),
            href: `/categories/${child.slug}`,
          }));

        return {
          key: `category-${category.slug}`,
          label,
          href: categoryHref,
          menu: childLinks.length > 0
            ? [{
                title: label,
                href: categoryHref,
                links: childLinks,
              }]
            : undefined,
        };
      });

    const categoriesMenu = categories
      .filter((category) => Boolean(category.slug))
      .map((category: HomeCategory | Category) => {
        const categoryHref = `/categories/${category.slug}`;
        const label = getCategoryLabel(category);
        const childLinks = (category.children || [])
          .filter((child) => Boolean(child.slug))
          .map((child) => ({
            label: getCategoryLabel(child as HomeCategory | Category),
            href: `/categories/${child.slug}`,
          }));

        return {
          title: label,
          href: categoryHref,
          links: childLinks.length > 0 ? childLinks : [{ label, href: categoryHref }],
        };
      });

    return [
      {
        key: "categories",
        label: navT("categories"),
        href: "/categories",
        menu: categoriesMenu.length > 0 ? categoriesMenu : undefined,
      },
      { key: "brands", label: navT("brands"), href: "/brands" },
      { key: "stores", label: navT("stores"), href: "/vendors" },
      {
        key: "below-50-jod",
        label: navT("below50JOD"),
        href: `/products?max_price=${BELOW_50_JOD_MAX_PRICE}`,
      },
      {
        key: "new-arrivals",
        label: navT("newArrivals"),
        href: "/products?sort_by=created_at:desc",
      },
      ...categoryLinks,
    ];
  }, [categories, isAr, navT]);

  const megaMenuContent = useMemo(
    () => Object.fromEntries(
      navigationLinks
        .filter((link) => link.menu?.length)
        .map((link) => [link.href, link.menu as MegaMenuSection[]])
    ) as Record<string, MegaMenuSection[]>,
    [navigationLinks]
  );

  const menuKeys = Object.keys(megaMenuContent);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredLinkKey, setHoveredLinkKey] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
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

  const updateIndicator = useCallback((linkKey: string | null) => {
    if (!linkKey || !navRef.current) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const navItem = navItemsRef.current.get(linkKey);
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

  const handleMouseEnter = useCallback((link: NavigationLink) => {
    clearTimeouts();
    setHoveredLinkKey(link.key);
    updateIndicator(link.key);

    if (megaMenuContent[link.href]?.length) {
      setActiveDropdown(link.href);
    } else {
      setActiveDropdown(null);
    }
  }, [megaMenuContent, updateIndicator]);

  const handleMouseLeave = useCallback(() => {
    clearTimeouts();
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setHoveredLinkKey(null);
      updateIndicator(null);
    }, 150);
  }, [updateIndicator]);

  const handleDropdownMouseEnter = useCallback(() => {
    clearTimeouts();
  }, []);

  const handleLinkClick = useCallback(() => {
    clearTimeouts();
    setActiveDropdown(null);
    setHoveredLinkKey(null);
    updateIndicator(null);
  }, [updateIndicator]);

  const syncScrollControls = useCallback(() => {
    const navElement = navRef.current;
    if (!navElement) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const normalizedScrollLeft = Math.abs(navElement.scrollLeft);
    const maxScrollLeft = Math.max(navElement.scrollWidth - navElement.clientWidth, 0);
    const threshold = 4;

    setCanScrollLeft(normalizedScrollLeft > threshold);
    setCanScrollRight(normalizedScrollLeft < maxScrollLeft - threshold);

    if (hoveredLinkKey) {
      updateIndicator(hoveredLinkKey);
    }
  }, [hoveredLinkKey, updateIndicator]);

  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) {
      return;
    }

    syncScrollControls();

    const handleScroll = () => syncScrollControls();
    navElement.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(handleScroll)
      : null;

    observer?.observe(navElement);

    return () => {
      navElement.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      observer?.disconnect();
    };
  }, [navigationLinks, syncScrollControls]);

  const scrollNav = useCallback((direction: "backward" | "forward") => {
    const navElement = navRef.current;
    if (!navElement) {
      return;
    }

    const step = direction === "forward" ? 240 : -240;
    navElement.scrollBy({
      left: isAr ? -step : step,
      behavior: "smooth",
    });
  }, [isAr]);

  const isDropdownOpen = Boolean(activeDropdown && megaMenuContent[activeDropdown]?.length);

  const handleWrapperMouseEnter = useCallback(() => {
    clearTimeouts();
  }, []);

  return (
    <div className="hidden lg:block bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/50 relative">
      <div 
        className="container mx-auto px-4 md:px-5 relative"
        onMouseEnter={handleWrapperMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative">
          {canScrollLeft ? (
            <button
              type="button"
              onClick={() => scrollNav("backward")}
              className="absolute inset-y-0 start-0 z-20 my-3 flex w-10 items-center justify-center rounded-full bg-white/95 text-primary shadow-s1 border border-gray-200/70"
              aria-label="Scroll navigation backward"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
          ) : null}

          {canScrollRight ? (
            <button
              type="button"
              onClick={() => scrollNav("forward")}
              className="absolute inset-y-0 end-0 z-20 my-3 flex w-10 items-center justify-center rounded-full bg-white/95 text-primary shadow-s1 border border-gray-200/70"
              aria-label="Scroll navigation forward"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          ) : null}

          <nav 
            ref={navRef}
            className="flex items-center justify-start gap-2 py-3 px-1 relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onMouseEnter={handleWrapperMouseEnter}
          >
            <div
              className="absolute h-10 bg-white rounded-full shadow-s1 border border-gray-200/50 pointer-events-none will-change-transform"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                opacity: indicatorStyle.opacity,
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />

            {navigationLinks.map((link) => (
              <div
                key={link.key}
                ref={(el) => {
                  if (el) navItemsRef.current.set(link.key, el);
                }}
                className="relative z-10"
                onMouseEnter={() => handleMouseEnter(link)}
              >
                <Link
                  href={link.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors duration-300",
                    (activeDropdown === link.href || hoveredLinkKey === link.key)
                      ? "text-primary"
                      : "text-third hover:text-primary"
                  )}
                >
                  {link.label}
                  {megaMenuContent[link.href]?.length ? (
                    <ChevronDown 
                      className={cn(
                        "w-4 h-4 transition-all",
                        activeDropdown === link.href && "rotate-180"
                      )} 
                    />
                  ) : null}
                </Link>
              </div>
            ))}
          </nav>
        </div>

        <div
          className={cn(
            "absolute left-0 right-0 top-full z-50",
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
          <div className="relative overflow-hidden rounded-b-4xl bg-white backdrop-blur-xl border border-t-0 border-gray-200/50 shadow-2xl shadow-gray-900/5">
            {menuKeys.map((menuKey) => {
              const sectionCount = megaMenuContent[menuKey].length;

              return (
                <div
                  key={menuKey}
                  className="transition-all duration-400 ease-out p-5"
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
                      sectionCount === 1
                        ? "grid-cols-1 max-w-xl mx-auto"
                        : sectionCount === 2
                          ? "grid-cols-2 max-w-2xl mx-auto"
                          : sectionCount <= 4
                            ? "grid-cols-4"
                            : "grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                    )}
                  >
                    {megaMenuContent[menuKey].map((section, idx) => (
                      <div
                        key={idx}
                        className="transition-all duration-300 ease-out"
                        style={{
                          transitionDelay: activeDropdown === menuKey ? `${idx * 40}ms` : "0ms",
                          opacity: activeDropdown === menuKey ? 1 : 0,
                          transform: activeDropdown === menuKey ? "translateY(0)" : "translateY(12px)",
                        }}
                      >
                        {section.href ? (
                          <Link href={section.href} onClick={handleLinkClick}>
                            <h3 className="mb-2 text-xs font-bold text-third uppercase tracking-wider hover:text-primary transition-colors cursor-pointer">
                              {section.title}
                            </h3>
                          </Link>
                        ) : (
                          <h3 className="mb-2 text-xs font-bold text-third uppercase tracking-wider">
                            {section.title}
                          </h3>
                        )}

                        <ul className="flex flex-col gap-1">
                          {section.links.map((link, linkIdx) => (
                            <li key={linkIdx}>
                              <Link
                                href={link.href}
                                className="group flex items-start gap-3 p-3 -mx-3 rounded-xl hover:bg-gray-50/80 transition-all duration-300"
                                onClick={handleLinkClick}
                              >
                                <div className="flex-1">
                                  <span className="block text-primary font-semibold group-hover:text-primary transition-colors duration-300">
                                    {link.label}
                                  </span>
                                  {link.description ? (
                                    <span className="block text-sm text-third mt-0.5">
                                      {link.description}
                                    </span>
                                  ) : null}
                                </div>
                                <ArrowRight
                                  className={cn(
                                    "w-4 h-4 text-third opacity-0 transition-all duration-300 mt-1 group-hover:opacity-100",
                                    isAr
                                      ? "translate-x-2 group-hover:translate-x-0 rotate-180"
                                      : "-translate-x-2 group-hover:translate-x-0"
                                  )}
                                />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
