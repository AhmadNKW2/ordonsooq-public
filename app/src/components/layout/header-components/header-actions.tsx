"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/useAuth";
import { IconButton } from "@/components/ui/icon-button";
import { Select, type SelectOption } from "@/components/ui";
import { LanguageSwitcher } from "./language-switcher";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuthModal } from "@/components/auth/auth-modal";
import { User, Package, LogOut, Wallet, Heart, MapPin, UserCog } from "lucide-react";

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

  const profileOptions: SelectOption[] = [
    { value: "/profile", label: t("myProfile"), icon: User },
    { value: "/profile/wallet", label: t("myWallet"), icon: Wallet },
    { value: "/profile/wishlist", label: t("myWishlist"), icon: Heart },
    { value: "/profile/addresses", label: t("addresses"), icon: MapPin },
    { value: "/orders", label: t("myOrders"), icon: Package },
    { value: "/profile/account", label: t("accountDetails"), icon: UserCog },
    { type: 'divider', value: 'divider', label: 'divider' },
    { value: "logout", label: t("logout"), icon: LogOut }
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
      {/* Mobile Search Toggle - Hidden since search bar is always visible */}
      {/* <IconButton
        variant="header"
        className="md:hidden"
        onClick={onSearchToggle}
        aria-label="Toggle search"
        icon="search"
      /> */}

      {/* Language Switcher - Desktop Only */}
      <div className="hidden lg:block">
        <LanguageSwitcher />
      </div>

      <div className="w-px h-8 bg-white/10 hidden lg:block"></div>

      {/* Wishlist - Always visible on mobile to replace language */}
      <Link href="/profile/wishlist" className="flex">
        <IconButton
          variant="header"
          badge={wishlistItems.length}
          aria-label="Wishlist"
          icon="heart"
        />
      </Link>

      <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

      {/* User Account */}
      <div className="relative hidden sm:block">
        {isAuthenticated ? (
          <Select
            options={profileOptions}
            value=""
            onChange={handleProfileChange}
            placeholder={`${t("hi")} ${user?.firstName}`}
            className="w-30"
            variant="header"
            icon={User}
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
