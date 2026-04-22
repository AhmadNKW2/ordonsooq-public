"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CartSidebar } from "@/components/cart";
import { IconButton } from "@/components/ui";
import { SearchBox } from "@/components/search/SearchBox";
import {
  TopBar,
  Logo,
  HeaderActions,
  MobileNav,
  NavigationBar,
} from "./header-components";
import { BottomNav } from "./bottom-nav";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileNavTop, setMobileNavTop] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    const updateMobileNavTop = () => {
      setMobileNavTop(headerRef.current?.getBoundingClientRect().bottom ?? 0);
    };

    updateMobileNavTop();

    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(updateMobileNavTop)
      : null;

    if (observer && headerRef.current) {
      observer.observe(headerRef.current);
    }

    window.addEventListener("resize", updateMobileNavTop);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateMobileNavTop);
    };
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-white shadow-s1 relative">
      {/* Top Bar */}
      <TopBar />

      {/* Main Header - Logo, Search, Actions */}
      <div className="bg-primary lg:border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-5">
          <div className="flex items-center gap-2 md:gap-4 justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <IconButton
              variant="header"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              icon={isMenuOpen ? "x" : "menu"}
            />

            {/* Logo */}
            <Logo />

            {/* Search Box with Autocomplete */}
            <div className="hidden lg:block flex-1 max-w-2xl mx-auto">
              <SearchBox />
            </div>

            {/* Actions - Wishlist, Profile, Cart */}
            <HeaderActions />
          </div>
        </div>
      </div>

      <div className="bg-primary lg:hidden pb-3">
        <div className="container mx-auto px-4 md:px-5">
          <SearchBox />
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <NavigationBar />

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMenuOpen} onClose={closeMenu} topOffset={mobileNavTop} />

      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </header>
  );
}
