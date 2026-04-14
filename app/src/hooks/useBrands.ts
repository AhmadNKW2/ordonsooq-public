import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { brandService } from '@/services/brand.service';
import type { BrandDetail, BrandFilters, ProductFilters } from '@/types/api.types';

export const BRAND_QUERY_KEYS = {
  all: ['brands'] as const,
  lists: () => [...BRAND_QUERY_KEYS.all, 'list'] as const,
  list: (filters: BrandFilters) => [...BRAND_QUERY_KEYS.lists(), filters] as const,
  details: () => [...BRAND_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...BRAND_QUERY_KEYS.details(), id] as const,
  detailBySlug: (slug: string, filters?: ProductFilters) => [...BRAND_QUERY_KEYS.details(), 'slug', slug, filters] as const,
  detailBySlugInfinite: (slug: string, filters?: Omit<ProductFilters, 'page'>) => [...BRAND_QUERY_KEYS.details(), 'slug', 'infinite', slug, filters] as const,
};

/**
 * Hook to fetch all brands with optional filters
 */
export function useBrands(filters: BrandFilters = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.list(filters),
    queryFn: () => brandService.getAll(filters),
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch a single brand by ID
 */
export function useBrand(id: number) {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.detail(id),
    queryFn: () => brandService.getById(id),
    enabled: !!id && id > 0,
  });
}

/**
 * Hook to fetch a single brand by Slug
 */
export function useBrandBySlug(slug: string, filters: ProductFilters = {}) {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.detailBySlug(slug, filters),
    queryFn: () => brandService.getBySlug(slug, filters),
    enabled: !!slug,
  });
}

/**
 * Hook to fetch a single brand by Slug with infinite pagination for its products
 */
export function useInfiniteBrandBySlug(
  slug: string,
  filters: Omit<ProductFilters, 'page'> = {},
  options?: { enabled?: boolean; initialData?: BrandDetail; initialPage?: number },
) {
  const initialPage = options?.initialPage ?? options?.initialData?.productsMeta?.page ?? 1;

  return useInfiniteQuery({
    queryKey: BRAND_QUERY_KEYS.detailBySlugInfinite(slug, filters),
    queryFn: ({ pageParam = 1 }) => brandService.getBySlug(slug, { ...filters, page: pageParam }),
    initialPageParam: initialPage,
    initialData: options?.initialData
      ? {
          pages: [options.initialData],
          pageParams: [initialPage],
        }
      : undefined,
    enabled: options?.enabled ?? !!slug,
    getNextPageParam: (lastPage) => {
      const page = lastPage.productsMeta?.page || 1;
      const totalPages = lastPage.productsMeta?.totalPages || 1;
      return page < totalPages ? page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const page = firstPage.productsMeta?.page || 1;
      return page > 1 ? page - 1 : undefined;
    },
  });
}
