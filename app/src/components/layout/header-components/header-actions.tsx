"use client";

import { Link } from "@/i18n/navigation";
import { Search, ShoppingCart, Heart, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { IconButton } from "@/components/ui/icon-button";
import { LanguageSwitcher } from "./language-switcher";

interface HeaderActionsProps {
  onSearchToggle: () => void;
}

export function HeaderActions({ onSearchToggle }: HeaderActionsProps) {
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  return (
    <div className="flex items-center gap-2">
      {/* Mobile Search Toggle */}
      <IconButton
        variant="header"
        className="md:hidden"
        onClick={onSearchToggle}
        aria-label="Toggle search"
      >
        <Search size={22} />
      </IconButton>

      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Wishlist */}
      <Link href="/wishlist" className="hidden sm:flex">
        <IconButton
          variant="header"
          badge={wishlistItems.length}
          aria-label="Wishlist"
        >
          <Heart size={22} />
        </IconButton>
      </Link>

      {/* User Account */}
      <Link href="/account" className="hidden sm:flex">
        <IconButton variant="header" aria-label="Account">
          <User size={22} />
        </IconButton>
      </Link>

      {/* Cart */}
      <Link href="/cart" className="hidden sm:flex">
        <IconButton
          variant="header"
          badge={totalItems}
          aria-label="Cart"
        >
          <ShoppingCart size={22} />
        </IconButton>
      </Link>
    </div>
  );
}
