"use client";

import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface MegaMenuSection {
  title: string;
  links: { label: string; href: string }[];
}

interface MegaMenuProps {
  content: MegaMenuSection[];
  isVisible: boolean;
  isAnimating: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onLinkClick: () => void;
}

export function MegaMenu({ 
  content, 
  isVisible, 
  isAnimating, 
  onMouseEnter, 
  onMouseLeave,
  onLinkClick 
}: MegaMenuProps) {
  const t = useTranslations();
  
  if (!isVisible || !content || content.length === 0) return null;

  return (
    <div 
      className={cn(
        "hidden lg:block absolute top-43 left-0 right-0 bg-white border-t border-gray-100 shadow-s1 z-50",
        "transition-all duration-300 ease-out",
        isAnimating 
          ? "opacity-100 visible" 
          : "opacity-0 invisible"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8">
          {content.map((section, idx) => (
            <div 
              key={idx}
              className={cn(
                "transition-all duration-300 ease-out",
                isAnimating 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-2"
              )}
              style={{ transitionDelay: isAnimating ? `${idx * 30}ms` : "0ms" }}
            >
              <h3 className="font-bold text-gray-900 mb-4 text-lg">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-1 group"
                      onClick={onLinkClick}
                    >
                      <ChevronRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Featured Banner in Mega Menu */}
        <div 
          className={cn(
            "mt-8 pt-6 border-t border-gray-100 transition-all duration-300 ease-out",
            isAnimating 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-2"
          )}
          style={{ transitionDelay: isAnimating ? "120ms" : "0ms" }}
        >
          <div className="flex items-center justify-between bg-linear-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
            <div>
              <h4 className="font-bold text-gray-900 text-lg">{t('home.shopByCategory')}</h4>
              <p className="text-gray-600 mt-1">{t('home.exploreCategories')}</p>
            </div>
            <Link href="/products?filter=sale">
              <Button>{t('common.viewAll')}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
