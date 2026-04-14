import { EntitySlugPageClient } from "@/components/layout/entity-slug-page-client";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { LISTING_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { searchFiltersToApiFilters, searchParamsToSearchFilters } from "@/lib/search/filter-utils";
import { brandService } from "@/services/brand.service";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const filters = searchParamsToSearchFilters(await searchParams);
  const apiFilters = searchFiltersToApiFilters(filters);
  const initialData = await brandService.getBySlug(slug, apiFilters).catch(() => undefined);

  return (
    <RouteIntlProvider locale={locale} namespaces={LISTING_MESSAGE_NAMESPACES}>
      <EntitySlugPageClient
        type="brand"
        slug={slug}
        initialData={initialData}
        initialPage={apiFilters.page}
      />
    </RouteIntlProvider>
  );
}
