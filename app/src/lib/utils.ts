import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY_CONFIG } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number,
  currency: string = CURRENCY_CONFIG.code,
  locale: string = "en"
): string {
  // If locale is Arabic, we might want to ensure we use the explicit symbol if Intl doesn't satisfy,
  // but usually Intl is best. However, let's map 'en' to 'en-JO' or 'en-US' and 'ar' to 'ar-JO' for JOD currency.
  
  const safeLocale = locale === 'ar' ? 'ar-JO' : 'en-US'; 
  
  // Force JOD if not provided or default
  const safeCurrency = currency === "USD" ? CURRENCY_CONFIG.code : currency;

  if (locale === 'ar' && safeCurrency === 'JOD') {
     const formattedNum = new Intl.NumberFormat('en-US', {
       style: 'decimal',
       minimumFractionDigits: 2,
       maximumFractionDigits: 2,
     }).format(price);
     return `${formattedNum} ${CURRENCY_CONFIG.symbolAr}`;
  }

  return new Intl.NumberFormat(safeLocale, {
    style: "currency",
    currency: safeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export const INPUT_STYLES = {
  base: "flex w-full rounded-lg border bg-white text-sm transition-all duration-300 placeholder:text-third focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
  default: "border-gray-200 hover:border-gray-300",
  error: "border-danger focus:ring-danger",
  padding: "px-2 py-2"
};

export function formatDate(
  date: string | Date,
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };
  return new Intl.DateTimeFormat(locale, defaultOptions).format(
    typeof date === "string" ? new Date(date) : date
  );
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function calculateDiscount(
  originalPrice: number,
  salePrice: number
): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + "s"}`;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}

export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    return {
      ...groups,
      [groupKey]: [...(groups[groupKey] || []), item],
    };
  }, {} as Record<string, T[]>);
}

export function sortByProperty<T>(
  array: T[],
  property: keyof T,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const valueA = a[property];
    const valueB = b[property];
    
    if (valueA < valueB) return order === "asc" ? -1 : 1;
    if (valueA > valueB) return order === "asc" ? 1 : -1;
    return 0;
  });
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getImagePlaceholder(width: number, height: number): string {
  return `https://placehold.co/${width}x${height}/e0d6ff/6d4bdd?text=ordonsooq`;
}
