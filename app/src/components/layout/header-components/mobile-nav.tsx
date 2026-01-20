"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Heart, User, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/auth-modal";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const t = useTranslations();
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      onClose();
      setIsAuthModalOpen(true);
    } else {
      onClose();
    }
  };


  return (
    <div
      className={cn(
        "lg:hidden fixed inset-0 top-[108px] bg-white z-40 transition-transform duration-300 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="p-4 flex flex-col gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="block px-4 py-3 text-primary hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-300 font-medium"
            onClick={onClose}
          >
            {t(link.label)}
          </Link>
        ))}
        <hr className="my-4" />
        <Link
          href="/profile/wishlist"
          className="flex items-center gap-3 px-4 py-3 text-primary hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-300 font-medium"
          onClick={handleWishlistClick}
        >
          <Heart size={20} />
          {t('nav.wishlist')}
        </Link>
        <Link
          href="/profile/account"
          className="flex items-center gap-3 px-4 py-3 text-primary hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-300 font-medium"
          onClick={onClose}
        >
          <User size={20} />
          {t('nav.myAccount')}
        </Link>
        
        <div className="px-4 py-3 flex items-center gap-3">
             <Globe size={20} className="text-primary" />
             <div className="flex-1">
                 <LanguageSwitcher />
             </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
