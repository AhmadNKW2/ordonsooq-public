"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SlidersHorizontal, Grid3X3, Grid2X2, List, X } from "lucide-react";
import { ProductGrid, ProductFilters, FilterState } from "@/components/products";
import { Button, Badge, Card, Select } from "@/components/ui";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { useProducts, useCategories } from "@/hooks";
import { transformProducts, transformCategories, type Locale } from "@/lib/transformers";
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
  const products = data?.data ? transformProducts(data.data, locale) : [];
  const categories = categoriesData?.data ? transformCategories(categoriesData.data, locale) : [];
  const totalProducts = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    (filters.priceRange ? 1 : 0) +
    (filters.rating ? 1 : 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">All Products</h1>
        <p className="text-third">
          Discover our wide selection of quality products
        </p>
      </div>

      {/* Toolbar */}
      <Card className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4">
        <div className="flex items-center gap-4">
          {/* Mobile Filter Toggle */}
          <Button
            color="white"
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Results Count */}
          <span className="text-sm text-third">
            {isLoading ? 'Loading...' : `${totalProducts} products found`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-third hidden sm:inline">
              Sort by:
            </span>
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={SORT_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
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
              aria-label="Grid 4 columns"
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
              aria-label="Grid 3 columns"
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
      <div className="flex gap-6">
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
              <h2 className="font-semibold text-lg">Filters</h2>
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
              <p className="text-secondary">Error loading products. Please try again.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-third">No products found matching your criteria.</p>
            </div>
          ) : (
            <>
              <ProductGrid
                products={products}
                columns={viewMode === "grid-4" ? 4 : viewMode === "grid-3" ? 3 : 2}
              />
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    color="white"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-third">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    color="white"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
