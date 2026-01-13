"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/useAuth";
import { IconButton } from "@/components/ui/icon-button";
import { Select } from "@/components/ui";
import { LanguageSwitcher } from "./language-switcher";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuthModal } from "@/components/auth/auth-modal";

interface HeaderActionsProps {
  onSearchToggle: () => void;

}

export function HeaderActions({ onSearchToggle }: HeaderActionsProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { totalItems, toggleCart } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const profileOptions = [
    { value: "/profile", label: t("myProfile") },
    { value: "/orders", label: t("myOrders") },
    { value: "logout", label: t("logout") }
  ];

  const handleProfileChange = (value: string) => {
    if (value === "logout") {
      handleLogout();
    } else {
      router.push(value);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Mobile Search Toggle */}
      <IconButton
        variant="header"
        className="md:hidden"
        onClick={onSearchToggle}
        aria-label="Toggle search"
        icon="search"
      />

      {/* Language Switcher */}
      <LanguageSwitcher />

      <div className="w-px h-8 bg-white/10"></div>

      {/* Wishlist */}
      <Link href="/wishlist" className="hidden sm:flex">
        <IconButton
          variant="header"
          badge={wishlistItems.length}
          aria-label="Wishlist"
          icon="heart"
        />
      </Link>

      <div className="w-px h-8 bg-white/10"></div>

      {/* User Account */}
      <div className="relative hidden sm:block">
        {isAuthenticated ? (
          <Select
            options={profileOptions}
            value=""
            onChange={handleProfileChange}
            placeholder={`${t("hi")} ${user?.firstName}`}
            className="w-48"
          />
        ) : (
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => setIsAuthModalOpen(true)}
          >
            <span
              className="text-white text-sm font-medium hidden lg:block px-1"
            >
              {t("login")}
            </span>

            <IconButton
              variant="header"
              aria-label="Login"
              icon="user"
            />
          </div>
        )}
      </div>

      <div className="w-px h-8 bg-white/10"></div>

      {/* Cart */}
      <div className="hidden sm:flex">
        <IconButton
          variant="header"
          badge={totalItems}
          aria-label="Cart"
          icon="cart"
          onClick={toggleCart}
        />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
