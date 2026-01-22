"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SlidersHorizontal, ArrowUpDown, Filter, Check } from "lucide-react";
import { ProductGrid, FilterState, ProductFilters } from "@/components/products";
import { Button, Badge, Card, Sheet, Select } from "@/components/ui";
import { useProducts, useCategories, useBrands, useListingVariantProducts } from "@/hooks";
import { transformCategories, transformBrands, type Locale } from "@/lib/transformers";
import { cn } from "@/lib/utils";
import type { ProductFilters as ApiProductFilters } from "@/types/api.types";
import { Category } from "@/types";

// Map frontend sort options to API sort options
const SORT_MAP: Record<string, { sortBy: ApiProductFilters['sortBy']; sortOrder: ApiProductFilters['sortOrder'] }> = {
  'popular': { sortBy: 'total_ratings', sortOrder: 'DESC' },
  'price-asc': { sortBy: 'name_en', sortOrder: 'ASC' },
  'price-desc': { sortBy: 'name_en', sortOrder: 'DESC' },
  'newest': { sortBy: 'created_at', sortOrder: 'DESC' },
  'rating': { sortBy: 'average_rating', sortOrder: 'DESC' },
};

interface ProductListingPageProps {
  initialFilters?: Partial<ApiProductFilters>;
  title?: string;
  subtitle?: string;
  headerContent?: React.ReactNode;
  showBreadcrumb?: boolean;
  availableCategories?: Category[]; // Optional Categories to show in filters
}

export function ProductListingPage({
  initialFilters = {},
  title,
  subtitle,
  headerContent,
  availableCategories
}: ProductListingPageProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const [viewMode, setViewMode] = useState<"grid-4" | "grid-3" | "list">("grid-4");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    categories: initialFilters.categoryId ? [String(initialFilters.categoryId)] : [],
    brands: initialFilters.brandId ? [String(initialFilters.brandId)] : [],
    priceRange: null,
    rating: null,
  });

  // Build API filters
  const apiFilters: ApiProductFilters = useMemo(() => {
    const sort = SORT_MAP[sortBy] || SORT_MAP['popular'];

    // Determine category ID: Sidebar selection > Initial Prop > undefined
    let categoryId = initialFilters.categoryId;
    if (filters.categories.length > 0) {
      // Assuming single selection for API for now, although UI allows multiple
      categoryId = Number(filters.categories[0]);
    }

    // Determine brand ID: Sidebar selection > Initial Prop > undefined
    let brandId = initialFilters.brandId;
    if (filters.brands.length > 0) {
      brandId = Number(filters.brands[0]);
    }

    return {
      page,
      limit: 12,
      status: 'active',
      visible: true,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
      ...initialFilters, // Default overrides

      // Override with user selection
      categoryId,
      brandId: filters.brands.length > 0 ? Number(filters.brands[0]) : (initialFilters.brandId || undefined), // Prioritize sidebar
      // Wait, if initialFilters has brandId (Brand Page), should sidebar allow changing it?
      // Usually yes, but maybe filter out *other* brands? 
      // User requirement: "Make reference in the header when... open any brand... I must see all products with this brand"
      // If I am on Brand X page, filtering by Brand Y is weird.
      // But maybe sub-brand?
      // For now, let's assume Sidebar Brand filter is "Enabled" on general Shop, but maybe hidden or pre-selected on Brand Page?
      // If `initialFilters.brandId` is set, we might want to HIDE brand filter in sidebar?
      // Or simply let `filters.brands` sync with it.

      minPrice: filters.priceRange?.min,
      maxPrice: filters.priceRange?.max,
      minRating: filters.rating || undefined,
    };
  }, [page, sortBy, filters, initialFilters]);

  // Fetch products
  const { data, isLoading, error } = useProducts(apiFilters);

  // Safe unwrap for products
  const productList = Array.isArray(data) ? data : (data?.data || []);
  const meta = Array.isArray(data) ? undefined : data?.meta;

  // Fetch categories (only if not provided)
  const { data: categoriesData } = useCategories({
    limit: 50,
    status: 'active',
    sortBy: 'sortOrder',
    sortOrder: 'ASC'
  }, { enabled: !availableCategories });

  const fetchedCategoryList = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);

  // Fetch brands
  const { data: brandsData } = useBrands({
    limit: 50,
    status: 'active',
    sortBy: 'sort_order',
    sortOrder: 'ASC'
  });
  const brandList = Array.isArray(brandsData) ? brandsData : (brandsData?.data || []);


  // Transform data
  const { products: products, isLoading: variantsLoading } = useListingVariantProducts(productList, locale);
  // If availableCategories are passed, they are assumed to be already transformed UI Category objects
  // If not, we fetched Raw categories and need to transform them
  const categories = availableCategories
    ? availableCategories
    : transformCategories(fetchedCategoryList, locale);

  const brands = transformBrands ? transformBrands(brandList, locale) : []; // Safely call if exists

  const totalProducts = meta?.total || productList.length;

  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    (filters.priceRange ? 1 : 0) +
    (filters.rating ? 1 : 0);

  const filtersComponent = (
    <ProductFilters
      categories={categories}
      brands={brands}
      selectedCategories={filters.categories}
      selectedBrands={filters.brands}
      priceRange={filters.priceRange || undefined}
      rating={filters.rating || undefined}
      onFilterChange={setFilters}
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
              onClick={() => {
                setSortBy(option.value);
                setShowSort(false);
              }}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg transition-colors text-start",
                sortBy === option.value ? "bg-primary/5 text-primary font-medium" : "hover:bg-gray-50 text-gray-700"
              )}
            >
              {option.label}
              {sortBy === option.value && <Check className="w-5 h-5" />}
            </button>
          ))}
        </div>
      </Sheet>

      {/* Floating Filter/Sort Pill (Mobile Only) */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 lg:hidden flex gap-2">
        <div className="bg-secondary/90 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center">
          <button
            onClick={() => setShowSort(true)}
            className="flex items-center gap-1 pr-2 pl-4 py-2 font-medium border-r border-white/20 text-nowrap"
          >
            <span>{t('sortBy')}</span>
            <ArrowUpDown size={16} />

          </button>
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-1 pl-2 pr-4 py-2 font-medium"
          >
            <span>{tCommon('filters')}</span>
            <Filter size={16} />
            {activeFiltersCount > 0 && (
              <span className="bg-white text-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

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
                value={sortBy}
                onChange={setSortBy}
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
              <ProductGrid
                products={products}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-lg">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {tCommon('noProductsFound')}
                </p>
                <Button
                  onClick={() => setFilters({
                    categories: [],
                    brands: [],
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
