'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchFilters } from '@/lib/search/use-search-params';
import { useInfiniteSearchProducts } from '@/lib/search/use-search';
import { ProductFilters, FloatingFilterSort } from '@/components/products';
import type { FilterState } from '@/components/products/product-filters';
import { SearchResults } from './SearchResults';
import { Button, Card, Sheet, Select } from '@/components/ui';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResponse, SearchFilters, SortOption } from '@/lib/search/types';

// Map UI sort keys → Typesense sort_by values (mirrors ProductListingPage mapping)
const SORT_MAP: Record<string, SortOption> = {
  'popular':    'popularity_score:desc',
  'newest':     'created_at:desc',
  'price-asc':  'price:asc',
  'price-desc': 'price:desc',
  'rating':     'rating:desc',
};

function toSortKey(sortBy?: SortOption): string {
  const entry = Object.entries(SORT_MAP).find(([, v]) => v === sortBy);
  return entry ? entry[0] : 'popular';
}

interface Props {
  initialData: SearchResponse | null;
  initialFilters: SearchFilters;
}

export function SearchPageClient({ initialData, initialFilters }: Props) {
  const t = useTranslations('product');
  const tSearch = useTranslations('search');
  const tCommon = useTranslations('common');
  
  const { filters, setSortBy, setPage, setMinPrice, setMaxPrice, changeFilter } = useSearchFilters();

  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // Sort key mirrors ProductListingPage (e.g. 'popular', 'price-asc', …)
  const [sortKey, setSortKey] = useState(() => toSortKey(initialFilters.sort_by));

  const handleSortChange = (key: string) => {
    setSortKey(key);
    void setSortBy(SORT_MAP[key] ?? 'popularity_score:desc');
    setShowSort(false);
  };

  // Local ProductFilters state (synced to URL via useSearchFilters)
  const [filterState, setFilterState] = useState<FilterState>({
    categories: initialFilters.category ? [initialFilters.category] : (initialFilters.category_ids ? initialFilters.category_ids.split(',') : []),
    brands:     initialFilters.brand    ? [initialFilters.brand]    : (initialFilters.brand_id ? [initialFilters.brand_id] : []),
    vendors:    initialFilters.vendor_id ? [initialFilters.vendor_id] : [],
    attrs:      initialFilters.attrs    || [],
    priceRange:
      initialFilters.min_price != null || initialFilters.max_price != null
        ? { min: initialFilters.min_price ?? 0, max: initialFilters.max_price ?? Infinity }
        : null,
    rating: null,
  });

  const handleFilterChange = (newState: FilterState) => {
    setFilterState(newState);
    void changeFilter('category', newState.categories.length > 0 ? newState.categories.join(',') : null);
    void changeFilter('brand',    newState.brands[0]    ?? null);
    void changeFilter('vendor_id',newState.vendors[0]   ?? null);
    void changeFilter('attrs',    newState.attrs.length > 0 ? newState.attrs : null);
    void setMinPrice(newState.priceRange?.min ?? null);
    void setMaxPrice(newState.priceRange?.max === Infinity ? null : (newState.priceRange?.max ?? null));
    void setPage(1);
  };

  // Merge URL filters with current sort key
  const searchFilters = useMemo<Omit<SearchFilters, 'page'>>(() => ({
    q: filters.q || initialFilters.q,
    category_ids: filters.category_ids,
    category: filters.category,
    subcategory: filters.subcategory,
    brand_id: filters.brand_id,
    brand: filters.brand,
    vendor_id: filters.vendor_id,
    attrs: filters.attrs,
    min_price: filters.min_price,
    max_price: filters.max_price,
    sort_by: SORT_MAP[sortKey] as SortOption,
    per_page: initialFilters.per_page ?? 20,
  }), [filters, initialFilters.per_page, initialFilters.q, sortKey]);

  const initialSearchFilters = useMemo<Omit<SearchFilters, 'page'>>(() => ({
    q: initialFilters.q,
    category_ids: initialFilters.category_ids,
    category: initialFilters.category,
    subcategory: initialFilters.subcategory,
    brand_id: initialFilters.brand_id,
    brand: initialFilters.brand,
    vendor_id: initialFilters.vendor_id,
    attrs: initialFilters.attrs,
    min_price: initialFilters.min_price,
    max_price: initialFilters.max_price,
    sort_by: initialFilters.sort_by ?? 'popularity_score:desc',
    per_page: initialFilters.per_page ?? 20,
  }), [initialFilters]);

  const shouldUseInitialData = useMemo(() => {
    if (!initialData) return false;
    return JSON.stringify(searchFilters) === JSON.stringify(initialSearchFilters);
  }, [initialData, initialSearchFilters, searchFilters]);

  const initialInfiniteData = useMemo(() => {
    if (!initialData || !shouldUseInitialData) return undefined;

    return {
      pages: [initialData],
      pageParams: [initialData.page ?? 1],
    };
  }, [initialData, shouldUseInitialData]);

  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteSearchProducts(searchFilters, {
    enabled: Boolean(searchFilters.q?.trim()),
    initialData: initialInfiniteData,
  });

  const pages = infiniteData?.pages ?? [];
  const results = pages[0] ?? (shouldUseInitialData ? initialData : null);
  const resultHits = useMemo(
    () => pages.flatMap((page) => page.hits ?? []),
    [pages]
  );

  const activeFiltersCount =
    filterState.categories.length +
    filterState.brands.length +
    filterState.vendors.length +
    filterState.attrs.length +
    (filterState.priceRange ? 1 : 0) +
    (filterState.rating ? 1 : 0);

  const sortOptions = [
    { value: 'popular',    label: t('sortPopular')   },
    { value: 'price-asc',  label: t('sortPriceAsc')  },
    { value: 'price-desc', label: t('sortPriceDesc') },
    { value: 'newest',     label: t('sortNewest')    },
    { value: 'rating',     label: t('sortRating')    },
  ];

  const filtersComponent = (
    <ProductFilters
      facets={results?.facets ?? []}
      selectedCategories={filterState.categories}
      selectedBrands={filterState.brands}
      selectedVendors={filterState.vendors}
      selectedAttrs={filterState.attrs}
      priceRange={filterState.priceRange ?? undefined}
      rating={filterState.rating ?? undefined}
      onFilterChange={handleFilterChange}
      className="w-full"
    />
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mobile — Filter sheet */}
      <Sheet isOpen={showFilters} onClose={() => setShowFilters(false)} title={tCommon('filters')} side="bottom">
        <div className="pb-8">
          {filtersComponent}
        </div>
      </Sheet>

      {/* Mobile — Sort sheet */}
      <Sheet isOpen={showSort} onClose={() => setShowSort(false)} title={t('sortBy')} side="bottom">
        <div className="flex flex-col gap-2 pb-8">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg transition-colors text-start",
                sortKey === option.value
                  ? "bg-primary/5 text-primary font-medium"
                  : "hover:bg-gray-50 text-gray-700"
              )}
            >
              {option.label}
              {sortKey === option.value && <Check className="w-5 h-5" />}
            </button>
          ))}
        </div>
      </Sheet>

      {/* Floating Filter/Sort Pill (Mobile Only) */}
      <FloatingFilterSort
        onSortClick={() => setShowSort(true)}
        onFilterClick={() => setShowFilters(true)}
        activeFiltersCount={activeFiltersCount}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters — always visible on desktop, same as product listing pages */}
        <aside className="w-full lg:w-64 shrink-0 hidden lg:block">
          <div className="sticky top-24">
            {filtersComponent}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Desktop Header Card */}
          <Card className="hidden lg:flex flex-wrap items-center justify-between gap-5 mb-6 p-4">
            <div className="flex items-center gap-5">
              <span className="text-sm text-gray-500 hidden sm:inline-block">
                {results ? tSearch('resultsFound', { count: results.total }) : null}
                {results && filters.q && filters.q !== '*' && (
                  <span>
                    {' '}
                    {tSearch('resultsFor')}{' '}
                    <span className="font-semibold text-primary">&quot;{filters.q}&quot;</span>
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-4 w-48">
              <Select
                options={sortOptions}
                value={sortKey}
                onChange={handleSortChange}
                variant="default"
                size="md"
              />
            </div>
          </Card>

          {/* Mobile Header (Total count only) */}
          <div className="lg:hidden mb-4 flex justify-between items-center px-2">
            <span className="text-sm text-gray-500">
              {results ? tSearch('resultsFound', { count: results.total }) : null}
              {results && filters.q && filters.q !== '*' && (
                <span>
                  {' '}
                  {tSearch('resultsFor')}{' '}
                  <span className="font-semibold text-primary">&quot;{filters.q}&quot;</span>
                </span>
              )}
            </span>
          </div>

          <SearchResults hits={resultHits} isLoading={isLoading && resultHits.length === 0} />

          {hasNextPage && (
            <div className="mt-10 flex justify-center">
              <Button
                onClick={() => void fetchNextPage()}
                isLoading={isFetchingNextPage}
                variant="outline"
                size="lg"
              >
                {tCommon('loadMoreProducts')}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
