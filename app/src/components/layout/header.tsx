"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { CartSidebar } from "@/components/cart";
import { Input, IconButton } from "@/components/ui";
import {
  TopBar,
  Logo,
  HeaderActions,
  MobileNav,
  NavigationBar,
} from "./header-components";
import { BottomNav } from "./bottom-nav";

export function Header() {
  const t = useTranslations('common');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-s1">
      {/* Top Bar */}
      <TopBar />

      {/* Main Header - Logo, Search, Actions */}
      <div className="bg-primary lg:border-b border-gray-100">
        <div className="container mx-auto flex flex-col gap-5 px-4 md:px-5">
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

            {/* Desktop Search - Now visible on mobile too */}
            <form
              onSubmit={handleSearch}
              className="flex items-center flex-1"
            >
              <Input
                type="search"
                variant="search"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Actions - Wishlist, Profile, Cart */}
            <HeaderActions onSearchToggle={() => setIsSearchOpen(!isSearchOpen)} />
          </div>

          {/* Mobile Search - Removed as we use the main search bar now */}
          {/* <SearchBar variant="mobile" isOpen={isSearchOpen} /> */}
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <NavigationBar />

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMenuOpen} onClose={closeMenu} />

      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </header>
  );
}
