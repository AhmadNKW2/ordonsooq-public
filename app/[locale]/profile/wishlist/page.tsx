import { getLocale } from "next-intl/server";
import { WishlistPageClient } from "./wishlist-page-client";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { PROFILE_WISHLIST_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";

export default async function WishlistPage() {
  const locale = (await getLocale()) as Locale;

  return (
    <RouteIntlProvider locale={locale} namespaces={PROFILE_WISHLIST_MESSAGE_NAMESPACES}>
      <WishlistPageClient />
    </RouteIntlProvider>
  );
}
