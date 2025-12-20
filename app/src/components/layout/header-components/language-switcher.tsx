"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { IconButton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

const locales = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇯🇴" },
] as const;

export function LanguageSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = locales.find((l) => l.code === locale);

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <IconButton
        variant="header"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("switchLanguage")}
        aria-expanded={isOpen}
        icon="globe"
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 py-2 bg-white rounded-lg shadow-lg border border-gray-100 min-w-[150px] z-50">
          {locales.map((localeItem) => (
            <button
              key={localeItem.code}
              onClick={() => handleLanguageChange(localeItem.code)}
              className={cn(
                "w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors",
                locale === localeItem.code && "bg-gray-50 text-primary font-medium"
              )}
            >
              <span className="text-lg">{localeItem.flag}</span>
              <span className="text-sm">{localeItem.nativeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
