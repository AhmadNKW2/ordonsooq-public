import { getLocale } from "next-intl/server";
import { ProductsPageClient } from "@/components/layout/products-page-client";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { LISTING_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";

export default async function ProductsPage() {
  const locale = (await getLocale()) as Locale;

  return (
    <RouteIntlProvider locale={locale} namespaces={LISTING_MESSAGE_NAMESPACES}>
      <ProductsPageClient />
    </RouteIntlProvider>
  );
}
