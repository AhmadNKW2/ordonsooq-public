import enMessages from "../../../messages/en.json";
import arMessages from "../../../messages/ar.json";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const messageCatalog = {
  en: enMessages,
  ar: arMessages,
} as const;

export type AppMessages = typeof enMessages;
export type MessageNamespace = keyof AppMessages;