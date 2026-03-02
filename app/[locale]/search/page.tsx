import { serverSearch } from '@/lib/search/api';
import { SearchPageClient } from '@/components/search/SearchPageClient';
import type { SearchFilters } from '@/lib/search/types';

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;

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
  const initialData = await serverSearch(filters).catch(() => null);

  return <SearchPageClient initialData={initialData} initialFilters={filters} />;
}
