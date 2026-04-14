import { isSearchDebugEnabled } from '@/lib/debug-fetch';
import { getLocale } from 'next-intl/server';
import { serverSearch } from '@/lib/search/api';
import { SearchPageClient } from '@/components/search/SearchPageClient';
import type { Locale } from '@/i18n/message-catalog';
import { RouteIntlProvider } from '@/i18n/route-intl-provider';
import { SEARCH_MESSAGE_NAMESPACES } from '@/i18n/scoped-messages';
import type { SearchFilters } from '@/lib/search/types';

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
    q:           params.q          || '*',
    brand:       params.brand,
    category:    params.category,
    subcategory: params.subcategory,
    min_price:   params.min_price   ? Number(params.min_price)  : undefined,
    max_price:   params.max_price   ? Number(params.max_price)  : undefined,
    sort_by:     (params.sort_by as SearchFilters['sort_by']) || 'popularity_score:desc',
    page:        params.page        ? Number(params.page)       : 1,
    per_page:    20,
  };

  // Initial data fetched on the server — no loading spinner on first render
  const initialData = await serverSearch(filters).catch((error) => {
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
