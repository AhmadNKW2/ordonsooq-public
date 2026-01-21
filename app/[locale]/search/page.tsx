"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search as SearchIcon, X, SlidersHorizontal } from "lucide-react";
import { Input, Button, Badge, Select } from "@/components/ui";
import { ProductGrid, ProductFilters, FilterState } from "@/components/products";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { useProductSearch, useCategories, useListingVariantProducts } from "@/hooks";
import { transformCategories, type Locale } from "@/lib/transformers";
import { SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProductFilters as ApiProductFilters } from "@/types/api.types";

// Map frontend sort options to API sort options
const SORT_MAP: Record<string, { sortBy: ApiProductFilters['sortBy']; sortOrder: ApiProductFilters['sortOrder'] }> = {
  'popular': { sortBy: 'total_ratings', sortOrder: 'DESC' },
  'price-asc': { sortBy: 'name_en', sortOrder: 'ASC' },
  'price-desc': { sortBy: 'name_en', sortOrder: 'DESC' },
  'newest': { sortBy: 'created_at', sortOrder: 'DESC' },
  'rating': { sortBy: 'average_rating', sortOrder: 'DESC' },
};

function SearchPageContent() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceRange: null,
    rating: null,
  });

  // Build API filters
  const sort = SORT_MAP[sortBy] || SORT_MAP['popular'];
  const apiFilters = {
    limit: 20,
    status: 'active' as const,
    visible: true,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    categoryId: filters.categories.length === 1 ? Number(filters.categories[0]) : undefined,
    minPrice: filters.priceRange?.min,
    maxPrice: filters.priceRange?.max,
    minRating: filters.rating || undefined,
  };

  // Fetch search results
  const { data: searchData, isLoading: searchLoading } = useProductSearch(query, apiFilters);
  
  // Fetch categories for filter sidebar
  const { data: categoriesData } = useCategories({ 
    limit: 50, 
    status: 'active',
    sortBy: 'sortOrder',
    sortOrder: 'ASC'
  });

  const { products: searchResults, isLoading: variantsLoading } = useListingVariantProducts(searchData?.data, locale);
  const categories = categoriesData?.data ? transformCategories(categoriesData.data, locale) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search query
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.pushState({}, "", url);
  };

  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    (filters.rating ? 1 : 0);

  return (
    <>
      {/* Search Header */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="pl-12 pr-12 py-4 text-lg"
              icon={SearchIcon}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-third hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {/* Search Info */}
        {query && (
          <p className="text-center text-third mt-4">
            {searchResults.length > 0 ? (
              <>
                {t('search.found')} <span className="font-semibold text-primary">{searchResults.length}</span> {t('search.resultsFor')}{" "}
                <span className="font-semibold text-primary">&quot;{query}&quot;</span>
              </>
            ) : (
              <>
                {t('search.noResultsFor')} <span className="font-semibold text-primary">&quot;{query}&quot;</span>
              </>
            )}
          </p>
        )}
      </div>

      {/* No Query State */}
      {!query && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchIcon className="w-12 h-12 text-third" />
          </div>
          <h2 className="text-xl font-bold text-primary mb-2">{t('search.startSearching')}</h2>
          <p className="text-third mb-8">
            {t('search.startSearchingDesc')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-sm text-third">{t('search.popularSearches')}</span>
            {["Electronics", "Laptop", "Headphones", "Camera", "Watch"].map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1 bg-gray-100 text-primary rounded-full text-sm hover:bg-primary hover:text-third transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      {query && (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-5 p-4 bg-white rounded-r1 border border-gray-100 shadow-s1 mb-6">
            <div className="flex items-center gap-5">
              {/* Mobile Filter Toggle */}
              <Button
                color="white"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t('search.filters')}
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* Results Count */}
              <span className="text-sm text-third">
                {t('search.resultsFound', { count: searchResults.length })}
              </span>
            </div>

            <div className="flex items-center gap-5">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-third hidden sm:inline">
                  {t('search.sortBy')}
                </span>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  options={SORT_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(option.label as any),
                  }))}
                  className="w-40"
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-5">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-72 shrink-0">
              <ProductFilters
                categories={categories}
                brands={[]}
                onFilterChange={setFilters}
              />
            </aside>

            {/* Mobile Filters Drawer */}
            <div
              className={cn(
                "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
                showFilters
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowFilters(false)}
              />
              <div
                className={cn(
                  "absolute left-0 top-0 h-full w-80 bg-white overflow-y-auto transition-transform duration-300",
                  showFilters ? "translate-x-0" : "-translate-x-full"
                )}
              >
                <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b border-gray-100">
                  <h2 className="font-semibold text-lg">{t('search.filters')}</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <ProductFilters
                    categories={categories}
                    brands={[]}
                    onFilterChange={setFilters}
                  />
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {searchLoading || variantsLoading ? (
                <ProductGridSkeleton count={8} />
              ) : searchResults.length > 0 ? (
                <ProductGrid products={searchResults} columns={4} />
              ) : (
                <div className="text-center py-16">
                  <p className="text-third">
                    {t('search.noProductsMatch')}
                  </p>
                  <Button
                    color="white"
                    onClick={() =>
                      setFilters({
                        categories: [],
                        brands: [],
                        priceRange: null,
                        rating: null,
                      })
                    }
                  >
                    {t('search.clearFilters')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto">
        <div className="max-w-2xl mx-auto">
          <div className="h-14 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
