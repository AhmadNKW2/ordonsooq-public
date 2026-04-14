import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale, messageCatalog } from './message-catalog';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: messageCatalog[locale as Locale]
  };
});
