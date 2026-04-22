import { isSearchDebugEnabled } from '@/lib/debug-fetch';
import { getLocale } from 'next-intl/server';
import { serverSearch } from '@/lib/search/api';
import { SearchPageClient } from '@/components/search/SearchPageClient';
import type { Locale } from '@/i18n/message-catalog';
import { RouteIntlProvider } from '@/i18n/route-intl-provider';
import { SEARCH_MESSAGE_NAMESPACES } from '@/i18n/scoped-messages';
import type { SearchFilters } from '@/lib/search/types';

function parseOptionalNumber(value?: string): number | undefined {
  if (!value) return undefined;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const locale = (await getLocale()) as Locale;
  const params = await searchParams;
  const shouldDebug = isSearchDebugEnabled();

  if (shouldDebug) {
    console.log('SSR SEARCH PARAMS:', params);
  }

  const filters: SearchFilters = {
    q: params.q || '*',
    category_ids: params.category_ids,
    brand_ids: params.brand_ids,
    vendor_ids: params.vendor_ids,
    attributes_values_ids: params.attributes_values_ids,
    specifications_values_ids: params.specifications_values_ids,
    min_price: parseOptionalNumber(params.min_price),
    max_price: parseOptionalNumber(params.max_price),
    is_out_of_stock: false,
    average_rating_min: parseOptionalNumber(params.average_rating_min),
    sort_by: params.sort_by as SearchFilters['sort_by'] | undefined,
    page: parseOptionalNumber(params.page) ?? 1,
    per_page: parseOptionalNumber(params.per_page) ?? 20,
  };

  // Initial data fetched on the server — no loading spinner on first render
  const initialData = await serverSearch(filters, locale).catch((error) => {
    if (shouldDebug) {
      console.log('SSR SEARCH ERROR:', error);
    }

    return null;
  });

  if (shouldDebug) {
    console.log('SSR SEARCH FILTERS:', filters);
    console.log('SSR DATA:', initialData);
  }

  return (
    <RouteIntlProvider locale={locale} namespaces={SEARCH_MESSAGE_NAMESPACES}>
      <SearchPageClient initialData={initialData} initialFilters={filters} />
    </RouteIntlProvider>
  );
}
