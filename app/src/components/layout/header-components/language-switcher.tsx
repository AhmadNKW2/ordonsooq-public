"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const isEnglish = locale === "en";
  const targetLocale = isEnglish ? "ar" : "en";
  const label = isEnglish ? "العربية" : "English";

  const handleLanguageChange = () => {
    router.replace(pathname, { locale: targetLocale });
  };

  return (
    <button
      onClick={handleLanguageChange}
      lang={targetLocale}
      className={cn(
        "flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-bold transition-colors",
        "text-white bg-primary lg:text-white hover:bg-secondary md:hover:bg-secondary active:bg-gray-200",
        "border border-primary hover:border-secondary md:border-secondary/50",
      )}
      aria-label={`Switch to ${label}`}
    >
      {label}
    </button>
  );
}
