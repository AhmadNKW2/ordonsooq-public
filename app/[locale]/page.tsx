import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { HomePageClient } from "@/components/home/home-page-client";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { HOME_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { PRODUCT_QUERY_KEYS } from "@/hooks/useProducts";
import { getQueryClient } from "@/lib/query-client";
import { productService } from "@/services/product.service";

export default async function HomePage() {
  const locale = (await getLocale()) as Locale;
  const queryClient = getQueryClient();
  const featuredFilters = {
    limit: 40,
    status: "active",
    visible: true,
    sortBy: "average_rating",
    sortOrder: "DESC",
  } as const;
  const newFilters = {
    limit: 40,
    status: "active",
    visible: true,
    sortBy: "created_at",
    sortOrder: "DESC",
  } as const;

  await Promise.allSettled([
    queryClient.prefetchInfiniteQuery({
      queryKey: PRODUCT_QUERY_KEYS.infinite(featuredFilters),
      queryFn: ({ pageParam = 1 }) => productService.getAll({ ...featuredFilters, page: pageParam }),
      initialPageParam: 1,
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: PRODUCT_QUERY_KEYS.infinite(newFilters),
      queryFn: ({ pageParam = 1 }) => productService.getAll({ ...newFilters, page: pageParam }),
      initialPageParam: 1,
    }),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <RouteIntlProvider locale={locale} namespaces={HOME_MESSAGE_NAMESPACES}>
      <HydrationBoundary state={dehydratedState}>
        <HomePageClient />
      </HydrationBoundary>
    </RouteIntlProvider>
  );
}

