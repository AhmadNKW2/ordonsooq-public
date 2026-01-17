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
        "text-primary lg:text-white hover:bg-gray-100 hover:text-primary active:bg-gray-200",
        "border border-primary lg:border-transparent hover:border-gray-200",
      )}
      aria-label={`Switch to ${label}`}
    >
      {label}
    </button>
  );
}
