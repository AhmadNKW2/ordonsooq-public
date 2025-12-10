import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import enMessages from '../../../messages/en.json';
import arMessages from '../../../messages/ar.json';

// Can be imported from a shared config
export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

const messages = {
  en: enMessages,
  ar: arMessages,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: messages[locale as Locale]
  };
});
