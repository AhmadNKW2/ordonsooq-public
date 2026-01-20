"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SlidersHorizontal, Grid3X3, Grid2X2, List, X } from "lucide-react";
import { ProductGrid, ProductFilters, FilterState } from "@/components/products";
import { Button, Badge, Card, Select } from "@/components/ui";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { useProducts, useCategories, useListingVariantProducts } from "@/hooks";
import { transformCategories, type Locale } from "@/lib/transformers";
import { SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProductFilters as ApiProductFilters } from "@/types/api.types";

// Map frontend sort options to API sort options
const SORT_MAP: Record<string, { sortBy: ApiProductFilters['sortBy']; sortOrder: ApiProductFilters['sortOrder'] }> = {
  'popular': { sortBy: 'total_ratings', sortOrder: 'DESC' },
  'price-asc': { sortBy: 'name_en', sortOrder: 'ASC' }, // API doesn't have price sort, fallback
  'price-desc': { sortBy: 'name_en', sortOrder: 'DESC' },
  'newest': { sortBy: 'created_at', sortOrder: 'DESC' },
  'rating': { sortBy: 'average_rating', sortOrder: 'DESC' },
};

export default function ProductsPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const tRoot = useTranslations();
  const [viewMode, setViewMode] = useState<"grid-4" | "grid-3" | "list">("grid-4");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceRange: null,
    rating: null,
  });

  // Build API filters
  const apiFilters: ApiProductFilters = useMemo(() => {
    const sort = SORT_MAP[sortBy] || SORT_MAP['popular'];
    return {
      page,
      limit: 12,
      status: 'active',
      visible: true,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
      categoryId: filters.categories.length === 1 ? Number(filters.categories[0]) : undefined,
      minPrice: filters.priceRange?.min,
      maxPrice: filters.priceRange?.max,
      minRating: filters.rating || undefined,
    };
  }, [page, sortBy, filters]);

  // Fetch products from API
  const { data, isLoading, error } = useProducts(apiFilters);

  // Fetch categories for filter sidebar
  const { data: categoriesData } = useCategories({ 
    limit: 50, 
    status: 'active',
    sortBy: 'sortOrder',
    sortOrder: 'ASC'
  });

  // Transform data with locale
  const { products: products, isLoading: variantsLoading } = useListingVariantProducts(data?.data, locale);
  const categories = categoriesData?.data ? transformCategories(categoriesData.data, locale) : [];
  const totalProducts = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    (filters.priceRange ? 1 : 0) +
    (filters.rating ? 1 : 0);

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">{t('allProductsTitle')}</h1>
        <p className="text-third">{t('allProductsSubtitle')}</p>
      </div>

      {/* Toolbar */}
      <Card className="flex flex-wrap items-center justify-between gap-5 mb-6 p-4">
        <div className="flex items-center gap-5">
          {/* Mobile Filter Toggle */}
          <Button
            color="white"
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('filtersTitle')}
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Results Count */}
          <span className="text-sm text-third">
            {isLoading || variantsLoading
              ? tCommon('loading')
              : t('productsFound', { count: products.length })}
          </span>
        </div>

        <div className="flex items-center gap-5">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-third hidden sm:inline">
              {t('sortBy')}:
            </span>
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={SORT_OPTIONS.map((option) => ({
                value: option.value,
                label: tRoot(option.label),
              }))}
              className="w-40"
              size="sm"
            />
          </div>

          {/* View Mode */}
          <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid-4")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "grid-4"
                  ? "bg-primary text-third"
                  : "hover:bg-gray-100"
              )}
              aria-label="Grid 5 columns"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid-3")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "grid-3"
                  ? "bg-primary text-third"
                  : "hover:bg-gray-100"
              )}
              aria-label="Grid 4 columns"
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "list"
                  ? "bg-primary text-third"
                  : "hover:bg-gray-100"
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

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
              <h2 className="font-semibold text-lg">{t('filtersTitle')}</h2>
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
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-secondary">{t('errorLoadingProducts')}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-third">{t('noProductsFound')}</p>
            </div>
          ) : (
            <>
              <ProductGrid
                products={products}
                columns={viewMode === "grid-4" ? 5 : viewMode === "grid-3" ? 4 : 2}
              />
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    color="white"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    {tCommon('previous')}
                  </Button>
                  <span className="text-sm text-third">{t('pagination', { page, totalPages })}</span>
                  <Button
                    color="white"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    {tCommon('next')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
