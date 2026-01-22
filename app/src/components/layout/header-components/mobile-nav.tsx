"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Heart, User, Globe, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/auth-modal";
import { useCategories } from "@/hooks";
import { transformCategories, type Locale } from "@/lib/transformers";
import { Category } from "@/types";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [history, setHistory] = useState<Category[]>([]);
  
  const isArabic = locale === 'ar';

  // Close menu when route changes
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Fetch Categories
  const { data: categoriesData } = useCategories({ 
    limit: 100, 
    status: 'active',
    sortBy: 'sortOrder',
    sortOrder: 'ASC'
  });
  
  const fetchedCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);
  const categories = transformCategories(fetchedCategories, locale);

  const currentCategory = history.length > 0 ? history[history.length - 1] : null;
  const displayedCategories = currentCategory ? currentCategory.children || [] : categories;

  const handleCategoryClick = (category: Category) => {
    if (category.children && category.children.length > 0) {
        setHistory([...history, category]);
    } else {
        onClose();
    }
  };

  const goBack = () => {
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
        "lg:hidden fixed inset-0 top-[108px] bg-white z-40 transition-transform duration-300 overflow-y-auto pb-20",
        isOpen ? "translate-x-0" : (isArabic ? "translate-x-full" : "-translate-x-full")
      )}
    >
      <nav className="p-4 flex flex-col gap-1 min-h-[50vh]">
        {/* Header / Back Button */}
        {history.length > 0 && (
            <button 
                onClick={goBack}
                className="flex items-center gap-2 px-4 py-3 text-gray-800 font-semibold mb-2 hover:bg-gray-50 rounded-lg"
            >
                {locale === 'en' ? <ArrowLeft size={20} /> : <ChevronRight size={20} />}
                <span>{currentCategory?.name}</span>
            </button>
        )}

        {/* Category List */}
        {displayedCategories.map((category) => {
            const hasChildren = category.children && category.children.length > 0;
            
            return hasChildren ? (
                // Drill-down button
                <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="flex items-center justify-between w-full px-4 py-3 text-start text-primary hover:bg-primary/5 rounded-lg transition-all duration-300 font-medium"
                >
                    <span>{category.name}</span>
                    <ChevronRight size={20} className="text-gray-400 rtl:rotate-180" />
                </button>
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

        {/* Separator if back at root */}
        {history.length === 0 && (
          <>
            <hr className="text-secondary" />
          </>
        )}
        
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
