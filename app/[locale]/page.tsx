import { HomePageClient } from "@/components/home/home-page-client";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { HOME_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { homeService } from "@/services/home.service";
import { productService } from "@/services/product.service";

export default async function HomePage() {
  const locale = (await getLocale()) as Locale;
  const [homeDataResult, featuredResult, newResult] = await Promise.allSettled([
    homeService.getHomeData(),
    productService.getAll({
      limit: 40,
      status: "active",
      visible: true,
      sortBy: "average_rating",
      sortOrder: "DESC",
    }),
    productService.getAll({
      limit: 40,
      status: "active",
      visible: true,
      sortBy: "created_at",
      sortOrder: "DESC",
    }),
  ]);

  return (
    <RouteIntlProvider locale={locale} namespaces={HOME_MESSAGE_NAMESPACES}>
      <HomePageClient
        initialHomeData={homeDataResult.status === "fulfilled" ? homeDataResult.value : null}
        initialFeaturedData={featuredResult.status === "fulfilled" ? featuredResult.value : null}
        initialNewData={newResult.status === "fulfilled" ? newResult.value : null}
      />
    </RouteIntlProvider>
  );
}

