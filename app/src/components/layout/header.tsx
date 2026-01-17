"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { CartSidebar } from "@/components/cart";
import {
  TopBar,
  Logo,
  SearchBar,
  HeaderActions,
  MobileNav,
  NavigationBar,
} from "./header-components";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-s1">
      {/* Top Bar */}
      <TopBar />

      {/* Main Header - Logo, Search, Actions */}
      <div className="bg-primary lg:border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 justify-between h-16 md:h-20">
            <div className="flex items-center gap-2">
                {/* Mobile Menu Button */}
                <button
                className="lg:hidden p-2 hover:bg-gray-100 text-white hover:text-primary rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Logo */}
                <Logo />
            </div>

            {/* Desktop Search - Now visible on mobile too */}
            <SearchBar variant="desktop" />

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
      <MobileNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Cart Sidebar */}
      <CartSidebar />
    </header>
  );
}
