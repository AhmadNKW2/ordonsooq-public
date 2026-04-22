import { EntitySlugPageClient } from "@/components/layout/entity-slug-page-client";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { LISTING_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { searchParamsToSearchFilters } from "@/lib/search/filter-utils";
import { serverSearch } from "@/lib/search/api";
import type { SearchFilters } from "@/lib/search/types";
import { categoryService } from "@/services/category.service";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const filters = searchParamsToSearchFilters(await searchParams);
  const initialData = await categoryService.getBySlug(slug).catch(() => undefined);
  const initialSearchFilters: SearchFilters | undefined = initialData
    ? {
        q: filters.q?.trim() ? filters.q : "*",
        category_ids: String(initialData.id),
        brand_ids: filters.brand_ids,
        vendor_ids: filters.vendor_ids,
        attributes_values_ids: filters.attributes_values_ids,
        specifications_values_ids: filters.specifications_values_ids,
        min_price: filters.min_price,
        max_price: filters.max_price,
        is_out_of_stock: false,
        average_rating_min: filters.average_rating_min,
        sort_by: filters.sort_by,
        page: filters.page ?? 1,
        per_page: 25,
      }
    : undefined;
  const initialSearchData = initialSearchFilters
    ? await serverSearch(initialSearchFilters, locale).catch(() => null)
    : null;

  return (
    <RouteIntlProvider locale={locale} namespaces={LISTING_MESSAGE_NAMESPACES}>
      <EntitySlugPageClient
        type="category"
        slug={slug}
        initialData={initialData}
        initialSearchFilters={initialSearchFilters}
        initialSearchData={initialSearchData}
      />
    </RouteIntlProvider>
  );
}
