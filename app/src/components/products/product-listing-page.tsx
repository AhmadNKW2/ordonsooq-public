"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { FilterState, ProductFilters, FloatingFilterSort } from "@/components/products";
import { ProductGrid } from "@/components/products/product-grid";
import { Button, Card, Sheet, Select } from "@/components/ui";
import { useListingVariantProducts } from "@/hooks";
import { useInfiniteSearchProducts } from "@/lib/search/use-search";
import { useSearchFilters } from "@/lib/search/use-search-params";
import type { SearchFilters, FacetCount, SortOption } from "@/lib/search/types";
import { cn } from "@/lib/utils";
import type { Brand as ApiBrand, PaginationMeta } from "@/types/api.types";
import { Category } from "@/types";
import type { Locale } from "@/lib/transformers";

// Map frontend sort options to API sort options
const SORT_MAP: Record<string, SortOption> = {
  'popular':    'popularity_score:desc',
  'newest':     'created_at:desc',
  'price-asc':  'price:asc',
  'price-desc': 'price:desc',
  'rating':     'rating:desc',
};

function toSortKey(sortBy?: string | SortOption): string {
  if (!sortBy) return 'popular';
  const entry = Object.entries(SORT_MAP).find(([, v]) => v === sortBy);
  return entry ? entry[0] : 'popular';
}

interface ProductListingPageProps {
  initialFilters?: Partial<SearchFilters>;
  title?: string;
  subtitle?: string;
  headerContent?: React.ReactNode;
  showBreadcrumb?: boolean;
  availableCategories?: Category[];
  preloadedProducts?: any[];
  preloadedBrands?: ApiBrand[];
  productsMeta?: PaginationMeta;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function ProductListingPage({
  initialFilters = {},
  title,
  subtitle,
  headerContent,
  availableCategories,
  preloadedProducts,
  preloadedBrands,
  productsMeta,
  onLoadMore,
  hasMore,
  isLoadingMore
}: ProductListingPageProps) {
  const locale = useLocale() as string;
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  
  const { filters: urlFilters, setSortBy: setUrlSortBy, setPage, setMinPrice, setMaxPrice, changeFilter } = useSearchFilters();

  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const [sortKey, setSortKey] = useState(() => toSortKey(initialFilters.sort_by || urlFilters.sort_by));

  const handleSortChange = (key: string) => {
    setSortKey(key);
    void setUrlSortBy(SORT_MAP[key] ?? 'popularity_score:desc');
    setShowSort(false);
  };

  const [filters, setFilters] = useState<FilterState>({
    categories: initialFilters.category_ids ? initialFilters.category_ids.split(',') : [],
    brands:     initialFilters.brand_id ? [initialFilters.brand_id] : (initialFilters.brand ? [initialFilters.brand] : []),
    vendors:    initialFilters.vendor_id ? [initialFilters.vendor_id] : [],
    attrs:      initialFilters.attrs    || [],
    priceRange:
      initialFilters.min_price != null || initialFilters.max_price != null
        ? { min: initialFilters.min_price ?? 0, max: initialFilters.max_price ?? Infinity }
        : null,
    rating: null,
  });

  const handleFilterChange = (newState: FilterState) => {
    setFilters(newState);
    void changeFilter('category_ids', newState.categories.length > 0 ? newState.categories.join(',') : null);
    void changeFilter('brand',    newState.brands[0]    ?? null);
    void changeFilter('vendor_id',newState.vendors[0]   ?? null);
    void changeFilter('attrs',    newState.attrs.length > 0 ? newState.attrs : null);
    void setMinPrice(newState.priceRange?.min ?? null);
    void setMaxPrice(newState.priceRange?.max === Infinity ? null : (newState.priceRange?.max ?? null));
    void setPage(1);
  };

  // Build API filters
  const searchFilters: Omit<SearchFilters, 'page'> = useMemo(() => {
    return {
      per_page: 25,
      ...initialFilters,
      ...urlFilters,
      sort_by: SORT_MAP[sortKey] as SortOption,
      // URL filters overwrite initial if present, but for base pages like Brand -> we want both or override
      category_ids: urlFilters.category_ids || initialFilters.category_ids,
      brand_id: urlFilters.brand_id || initialFilters.brand_id,
      vendor_id: urlFilters.vendor_id || initialFilters.vendor_id,
      brand: urlFilters.brand || initialFilters.brand,
      attrs: urlFilters.attrs || initialFilters.attrs,
    };
  }, [sortKey, urlFilters, initialFilters]);

  // Infinite query — resets automatically when searchFilters changes
    const useSearch = !onLoadMore; // Only use search API if we don't have custom load handlers
    const {
      data: infiniteData,
      isLoading: isSearchLoading,
      isFetchingNextPage: searchIsFetchingNextPage,
      hasNextPage: searchHasNextPage,
      fetchNextPage: searchFetchNextPage,
    } = useInfiniteSearchProducts(searchFilters, { 
      enabled: useSearch,
      initialData: preloadedProducts && productsMeta && useSearch ? {
        pages: [{
          hits: preloadedProducts,
          total: productsMeta.total,
          total_pages: productsMeta.totalPages,
          page: productsMeta.page,
          per_page: productsMeta.limit || 25,
          facets: [] // Or map facets if we pass them
        }],
        pageParams: [1]
      } : undefined
    });

    const isLoading = (isSearchLoading && useSearch && !preloadedProducts) || (!useSearch && !preloadedProducts);

    const actualFetchNextPage = onLoadMore || searchFetchNextPage;
    const actualHasNextPage = hasMore !== undefined ? hasMore : searchHasNextPage;
    const actualIsFetchingNextPage = isLoadingMore !== undefined ? isLoadingMore : searchIsFetchingNextPage;

  // Flatten all fetched pages into a single list
  const productList = useMemo(() => {
      if (!useSearch && preloadedProducts) return preloadedProducts;
      return infiniteData?.pages.flatMap((p) => p.hits || []) ?? [];
    }, [infiniteData, useSearch, preloadedProducts]);

    const totalProducts = useMemo(() => {
      if (!useSearch) return productsMeta?.total || productList.length;
      if (infiniteData?.pages) {
        // Use meta from the last page for the real total count
        const lastPage = infiniteData?.pages.at(-1);
        return lastPage?.total ?? productList.length;
      }
      return productsMeta?.total || productList.length;
    }, [infiniteData, productList.length, productsMeta, useSearch]);
  const facets = useMemo(() => {
    const firstPage = infiniteData?.pages.at(0);
    return firstPage?.facets || [];
  }, [infiniteData]);

  // Transform data
  const { products: products, isLoading: variantsLoading } = useListingVariantProducts(productList as unknown as any[], locale as Locale);

  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    filters.vendors.length +
    filters.attrs.length +
    (filters.priceRange ? 1 : 0) +
    (filters.rating ? 1 : 0);

  const filtersComponent = (
    <ProductFilters
      facets={facets}
      selectedCategories={filters.categories}
      selectedBrands={filters.brands}
      selectedVendors={filters.vendors}
      selectedAttrs={filters.attrs}
      priceRange={filters.priceRange || undefined}
      rating={filters.rating || undefined}
      onFilterChange={handleFilterChange}
      className="w-full"
    />
  );

  const sortOptions = [
    { value: "popular", label: t('sortPopular') },
    { value: "price-asc", label: t('sortPriceAsc') },
    { value: "price-desc", label: t('sortPriceDesc') },
    { value: "newest", label: t('sortNewest') },
    { value: "rating", label: t('sortRating') },
  ];

  return (
    <>
      <Sheet isOpen={showFilters} onClose={() => setShowFilters(false)} title={tCommon('filters')} side="bottom">
        <div className="pb-8">
          {filtersComponent}
        </div>
      </Sheet>

      <Sheet isOpen={showSort} onClose={() => setShowSort(false)} title={t('sortBy')} side="bottom">
        <div className="flex flex-col gap-2 pb-8">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg transition-colors text-start",
                sortKey === option.value ? "bg-primary/5 text-primary font-medium" : "hover:bg-gray-50 text-gray-700"
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
        {/* Sidebar Filters */}
        <aside
          className="w-full lg:w-64 flex-shrink-0 hidden lg:block"
        >
          <div className="sticky top-24">
            {filtersComponent}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {headerContent}

          {(title || subtitle) && !headerContent && (
            <div className="mb-8">
              {title && <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>}
              {subtitle && <p className="text-third">{subtitle}</p>}
            </div>
          )}

          {/* Desktop Header Card */}
          <Card className="hidden lg:flex flex-wrap items-center justify-between gap-5 mb-6 p-4">
            <div className="flex items-center gap-5">
              <span className="text-sm text-gray-500 hidden sm:inline-block">
                {totalProducts} {tCommon('products')}
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

          {/* Mobile Header (Just Total Count) */}
          <div className="lg:hidden mb-4 flex justify-between items-center px-2">
            <span className="text-sm text-gray-500">
              {totalProducts} {tCommon('products')}
            </span>
          </div>

          <div className="min-h-[400px]">
            {isLoading || variantsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : productList.length > 0 ? (
              <>
                <ProductGrid products={products} />

                  {/* Show More button — only when there are more API pages from Search/Entities */}
                  {actualHasNextPage && (
                  <div className="flex justify-center pt-10 pb-5">
                    <Button
                      variant="pill"
                      size="lg"
                      onClick={() => actualFetchNextPage()}
                      disabled={actualIsFetchingNextPage}
                      className="min-w-50 bg-white hover:bg-white/90 shadow-gray-200/50 border border-gray-200 text-primary"
                    >
                      {actualIsFetchingNextPage ? tCommon('loading') : tCommon('loadMoreProducts')}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-lg">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {tCommon('noProductsFound')}
                </p>
                <Button
                  onClick={() => handleFilterChange({
                    categories: [],
                    brands: [],
                    vendors: [],
                    attrs: [],
                    priceRange: null,
                    rating: null,
                  })}
                >
                  {tCommon('clearAll', { count: '' }).replace('()', '')}
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
