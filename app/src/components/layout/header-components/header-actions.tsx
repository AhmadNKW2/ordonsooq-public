"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/useAuth";
import { IconButton } from "@/components/ui/icon-button";
import { LanguageSwitcher } from "./language-switcher";
import { useState, useRef, useEffect } from "react";
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

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    router.push('/');
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
      <div className="relative hidden sm:block" ref={menuRef}>
        {isAuthenticated ? (
          <div className="relative">
            <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
                <IconButton
                  variant="header"
                  aria-label="Account"
                  icon="user"
                  className={isUserMenuOpen ? "bg-gray-100" : ""}
                />
                <span className="text-sm font-medium text-white hidden md:block select-none">
                    {t("hi")} {user?.firstName}
                </span>
            </div>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                </div>

                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  {t("myProfile")}
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  {t("myOrders")}
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => setIsAuthModalOpen(true)}
          >
            <span
              className="text-white text-sm font-medium hover:text-primary hidden lg:block"
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
