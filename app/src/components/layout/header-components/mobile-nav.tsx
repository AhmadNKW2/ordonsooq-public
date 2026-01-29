"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Heart, User, Globe, ChevronRight, ChevronLeft, ArrowLeft, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/auth-modal";
import { useHome } from "@/hooks";
import { transformHomeCategory, type Locale } from "@/lib/transformers";
import { Category } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [history, setHistory] = useState<Category[]>([]);
  const [direction, setDirection] = useState(0);

  const isArabic = locale === 'ar';

  // Close menu when route changes
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Fetch Categories
  const { data: homeData } = useHome();

  const categories = (homeData?.categories || [])
    .filter(c => c.level === 0 || c.parent_id === null)
    .map(c => transformHomeCategory(c, locale));

  const currentCategory = history.length > 0 ? history[history.length - 1] : null;
  const displayedCategories = currentCategory ? currentCategory.children || [] : categories;

  const handleCategoryClick = (category: Category) => {
    if (category.children && category.children.length > 0) {
      setDirection(1);
      setHistory([...history, category]);
    } else {
      onClose();
    }
  };

  const goBack = () => {
    setDirection(-1);
    setHistory(history.slice(0, -1));
  };


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
        "lg:hidden fixed inset-0 top-[100px] bg-white z-40 transition-transform duration-300 flex flex-col",
        isOpen ? "translate-x-0" : (isArabic ? "translate-x-full" : "-translate-x-full")
      )}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <nav className="min-h-full">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.div
              key={currentCategory?.id || "root"}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", ease: "easeInOut", duration: 0.3 },
                opacity: { duration: 0.2 }
              }}
              className="p-4 flex flex-col gap-1"
            >
              {/* Header / Back Button */}
              {history.length > 0 && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 px-4 py-3 text-gray-800 font-semibold mb-2 hover:bg-gray-50 rounded-lg text-start"
                >
                  {locale === 'en' ? <ArrowLeft size={20} /> : <ChevronRight size={20} />}
                  <span>{currentCategory?.name}</span>
                </button>
              )}

              {/* Category List */}
              {displayedCategories.map((category) => {
                const hasChildren = category.children && category.children.length > 0;

                return hasChildren ? (
                  <div key={category.id} className="flex items-center gap-2 w-full group">
                    {/* Drill-down button */}
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className="flex-1 flex items-center justify-between px-4 py-3 text-start text-primary group-hover:bg-primary/5 rounded-lg transition-all duration-300 font-medium"
                    >
                      <span>{category.name}</span>
                      <ChevronRight size={20} className="text-gray-400 rtl:rotate-180" />
                    </button>

                    {/* Direct Link Button */}
                    <Link
                      href={`/categories/${category.slug}`}
                      onClick={onClose}
                      title={category.name}
                      className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-gray-100"
                    >
                      <ExternalLink size={18} />
                    </Link>
                  </div>
                ) : (
                  // Leaf Link
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="block px-4 py-3 text-primary hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-300 font-medium"
                    onClick={onClose}
                  >
                    {category.name}
                  </Link>
                );
              })}

              {displayedCategories.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  {t('common.noCategories')}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </nav>
      </div>

      <div className="mb-16 p-4 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-center items-center gap-3">
          <LanguageSwitcher />
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
