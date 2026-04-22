"use client";

import { useEffect, useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { FilterState, ProductFilters, FloatingFilterSort, MobileContactActions } from "@/components/products";
import { ProductGrid } from "@/components/products/product-grid";
import { Button, Card, Sheet, Select } from "@/components/ui";
import { useLoading } from "@/components/ui/global-loader";
import { useListingVariantProducts } from "@/hooks/useListingVariantProducts";
import { joinFilterValues, splitFilterValues } from "@/lib/search/filter-utils";
import { useInfiniteSearchProducts } from "@/lib/search/use-search";
import { useSearchFilters } from "@/lib/search/use-search-params";
import type { SearchFilters, SearchResponse, SortOption } from "@/lib/search/types";
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

function normalizeSearchFilterValue(value: string | number | boolean | undefined) {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }

  return value;
}

function serializeSearchFilterSnapshot(filters: Partial<Omit<SearchFilters, 'page'>>) {
  return JSON.stringify({
    q: normalizeSearchFilterValue(filters.q),
    category_ids: normalizeSearchFilterValue(filters.category_ids),
    brand_ids: normalizeSearchFilterValue(filters.brand_ids),
    vendor_ids: normalizeSearchFilterValue(filters.vendor_ids),
    attributes_values_ids: normalizeSearchFilterValue(filters.attributes_values_ids),
    specifications_values_ids: normalizeSearchFilterValue(filters.specifications_values_ids),
    min_price: filters.min_price,
    max_price: filters.max_price,
    is_out_of_stock: filters.is_out_of_stock,
    average_rating_min: filters.average_rating_min,
    sort_by: normalizeSearchFilterValue(filters.sort_by),
    per_page: filters.per_page,
  });
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
  initialSearchData?: SearchResponse | null;
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
  initialSearchData,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: ProductListingPageProps) {
  const locale = useLocale() as string;
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const { setIsLoading } = useLoading();
  
  const {
    filters: urlFilters,
    setSortBy: setUrlSortBy,
    setPage,
    setMinPrice,
    setMaxPrice,
    setAverageRatingMin,
    setIsOutOfStock,
    changeFilter,
  } = useSearchFilters();

  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const [sortKey, setSortKey] = useState(() => toSortKey(initialFilters.sort_by || urlFilters.sort_by));

  const handleSortChange = (key: string) => {
    if (key === sortKey) {
      setShowSort(false);
      return;
    }

    setIsLoading(true);
    setSortKey(key);
    void setUrlSortBy(key === 'popular' ? null : (SORT_MAP[key] ?? null));
    setShowSort(false);
  };

  const [filters, setFilters] = useState<FilterState>({
    categories: splitFilterValues(initialFilters.category_ids),
    brands: splitFilterValues(initialFilters.brand_ids),
    vendors: splitFilterValues(initialFilters.vendor_ids),
    attributeValues: splitFilterValues(initialFilters.attributes_values_ids),
    specificationValues: splitFilterValues(initialFilters.specifications_values_ids),
    priceRange:
      initialFilters.min_price != null || initialFilters.max_price != null
        ? { min: initialFilters.min_price ?? 0, max: initialFilters.max_price ?? Infinity }
        : null,
    rating: initialFilters.average_rating_min ?? null,
  });

  const resolvedFilterState = useMemo<FilterState>(() => ({
    categories: splitFilterValues(urlFilters.category_ids ?? initialFilters.category_ids),
    brands: splitFilterValues(urlFilters.brand_ids ?? initialFilters.brand_ids),
    vendors: splitFilterValues(urlFilters.vendor_ids ?? initialFilters.vendor_ids),
    attributeValues: splitFilterValues(urlFilters.attributes_values_ids ?? initialFilters.attributes_values_ids),
    specificationValues: splitFilterValues(urlFilters.specifications_values_ids ?? initialFilters.specifications_values_ids),
    priceRange:
      urlFilters.min_price != null || urlFilters.max_price != null
        ? { min: urlFilters.min_price ?? 0, max: urlFilters.max_price ?? Infinity }
        : initialFilters.min_price != null || initialFilters.max_price != null
          ? { min: initialFilters.min_price ?? 0, max: initialFilters.max_price ?? Infinity }
          : null,
    rating: urlFilters.average_rating_min ?? initialFilters.average_rating_min ?? null,
  }), [
    urlFilters.category_ids,
    urlFilters.brand_ids,
    urlFilters.vendor_ids,
    urlFilters.attributes_values_ids,
    urlFilters.specifications_values_ids,
    urlFilters.min_price,
    urlFilters.max_price,
    urlFilters.average_rating_min,
    initialFilters.category_ids,
    initialFilters.brand_ids,
    initialFilters.vendor_ids,
    initialFilters.attributes_values_ids,
    initialFilters.specifications_values_ids,
    initialFilters.min_price,
    initialFilters.max_price,
    initialFilters.average_rating_min,
  ]);

  useEffect(() => {
    setFilters(resolvedFilterState);
  }, [resolvedFilterState]);

  useEffect(() => {
    if (urlFilters.is_out_of_stock != null) {
      void setIsOutOfStock(null);
    }
  }, [setIsOutOfStock, urlFilters.is_out_of_stock]);

  const handleFilterChange = (newState: FilterState) => {
    if (JSON.stringify(newState) !== JSON.stringify(filters)) {
      setIsLoading(true);
    }

    setFilters(newState);
    void changeFilter('category_ids', joinFilterValues(newState.categories));
    void changeFilter('brand_ids', joinFilterValues(newState.brands));
    void changeFilter('vendor_ids', joinFilterValues(newState.vendors));
    void changeFilter('attributes_values_ids', joinFilterValues(newState.attributeValues));
    void changeFilter('specifications_values_ids', joinFilterValues(newState.specificationValues));
    void setMinPrice(newState.priceRange?.min ?? null);
    void setMaxPrice(newState.priceRange?.max === Infinity ? null : (newState.priceRange?.max ?? null));
    void setAverageRatingMin(newState.rating ?? null);
    void setPage(1);
  };

  // Build API filters
  const searchFilters: Omit<SearchFilters, 'page'> = useMemo(() => {
    return {
      q: urlFilters.q?.trim() ? urlFilters.q : initialFilters.q,
      category_ids: joinFilterValues(filters.categories) ?? undefined,
      brand_ids: joinFilterValues(filters.brands) ?? undefined,
      vendor_ids: joinFilterValues(filters.vendors) ?? undefined,
      attributes_values_ids: joinFilterValues(filters.attributeValues) ?? undefined,
      specifications_values_ids: joinFilterValues(filters.specificationValues) ?? undefined,
      min_price: filters.priceRange?.min,
      max_price: filters.priceRange?.max === Infinity ? undefined : filters.priceRange?.max,
      is_out_of_stock: false,
      average_rating_min: filters.rating ?? undefined,
      sort_by: sortKey === 'popular' ? undefined : SORT_MAP[sortKey],
      per_page: initialFilters.per_page ?? 25,
    };
  }, [sortKey, urlFilters.q, initialFilters.q, initialFilters.per_page, filters]);

  const shouldUseInitialSearchData = useMemo(() => {
    if (!initialSearchData) {
      return false;
    }

    const initialSearchFilterSnapshot = serializeSearchFilterSnapshot({
      q: initialFilters.q,
      category_ids: initialFilters.category_ids,
      brand_ids: initialFilters.brand_ids,
      vendor_ids: initialFilters.vendor_ids,
      attributes_values_ids: initialFilters.attributes_values_ids,
      specifications_values_ids: initialFilters.specifications_values_ids,
      min_price: initialFilters.min_price,
      max_price: initialFilters.max_price,
      is_out_of_stock: initialFilters.is_out_of_stock ?? false,
      average_rating_min: initialFilters.average_rating_min,
      sort_by: initialFilters.sort_by,
      per_page: initialFilters.per_page ?? 25,
    });

    const currentSearchFilterSnapshot = serializeSearchFilterSnapshot(searchFilters);

    return initialSearchFilterSnapshot === currentSearchFilterSnapshot;
  }, [initialSearchData, initialFilters, searchFilters]);

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
      locale,
      initialData: shouldUseInitialSearchData && initialSearchData
        ? {
            pages: [initialSearchData],
            pageParams: [initialSearchData.page ?? 1],
          }
        : preloadedProducts && productsMeta && useSearch
          ? {
              pages: [{
                hits: preloadedProducts,
                total: productsMeta.total,
                total_pages: productsMeta.totalPages,
                page: productsMeta.page,
                per_page: productsMeta.limit || 25,
                facets: []
              }],
              pageParams: [1]
            }
          : undefined
    });

    const isLoading = (isSearchLoading && useSearch && !preloadedProducts && !initialSearchData) || (!useSearch && !preloadedProducts);

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
    filters.attributeValues.length +
    filters.specificationValues.length +
    (filters.priceRange ? 1 : 0) +
    (filters.rating ? 1 : 0);

  const filtersComponent = (
    <ProductFilters
      key={`${locale}|listing|${initialFilters.q ?? '*'}|${initialFilters.category_ids ?? ''}|${initialFilters.brand_ids ?? ''}|${initialFilters.vendor_ids ?? ''}`}
      facets={facets}
      selectedCategories={filters.categories}
      selectedBrands={filters.brands}
      selectedVendors={filters.vendors}
      selectedAttributeValues={filters.attributeValues}
      selectedSpecificationValues={filters.specificationValues}
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

      <MobileContactActions />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside
          className="hidden w-full shrink-0 lg:block lg:w-64"
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

          <div className="min-h-100">
            {isLoading || variantsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-2/3 animate-pulse rounded-lg bg-gray-100" />
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
                    attributeValues: [],
                    specificationValues: [],
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
