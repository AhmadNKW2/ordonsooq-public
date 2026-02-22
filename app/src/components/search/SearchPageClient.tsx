'use client';

import { useTranslations } from 'next-intl';
import { useSearchFilters } from '@/lib/search/use-search-params';
import { useSearch } from '@/lib/search/use-search';
import { SearchFilters as FiltersPanel } from './SearchFilters';
import { SearchResults } from './SearchResults';
import { SortSelect } from './SortSelect';
import { Pagination } from './Pagination';
import { MobileFilterDrawer } from './MobileFilterDrawer';
import type { SearchResponse, SearchFilters } from '@/lib/search/types';

interface Props {
  initialData: SearchResponse | null;
  initialFilters: SearchFilters;
}

export function SearchPageClient({ initialData, initialFilters }: Props) {
  const t = useTranslations('search');
  const { filters, setSortBy, setPage } = useSearchFilters();

  // Client-side updates after first render; uses initialData until filters change
  const { data, isLoading } = useSearch(filters, initialData);
  const results = data ?? initialData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Results count + sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <p className="text-sm text-third">
          {results
            ? t('resultsFound', { count: results.total })
            : null}
          {results && filters.q && filters.q !== '*' && (
            <span>
              {' '}
              {t('resultsFor')}{' '}
              <span className="font-semibold text-primary">&quot;{filters.q}&quot;</span>
            </span>
          )}
        </p>
        <SortSelect
          value={filters.sort_by ?? 'popularity_score:desc'}
          onChange={setSortBy}
        />
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters — desktop */}
        {results?.facets && results.facets.length > 0 && (
          <>
            <aside className="hidden lg:block w-64 shrink-0">
              <FiltersPanel facets={results.facets} />
            </aside>

            {/* Mobile filter drawer */}
            <MobileFilterDrawer facets={results.facets} />
          </>
        )}

        {/* Main results */}
        <main className="flex-1">
          <SearchResults hits={results?.hits ?? []} isLoading={isLoading} />
          {results && results.total_pages > 1 && (
            <Pagination
              page={results.page}
              totalPages={results.total_pages}
              onPageChange={setPage}
            />
          )}
        </main>
      </div>
    </div>
  );
}
