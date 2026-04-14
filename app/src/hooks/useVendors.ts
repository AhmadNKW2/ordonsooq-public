import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { vendorService } from '@/services/vendor.service';
import type { VendorDetail, VendorFilters, ProductFilters } from '@/types/api.types';

export const VENDOR_QUERY_KEYS = {
  all: ['vendors'] as const,
  lists: () => [...VENDOR_QUERY_KEYS.all, 'list'] as const,
  list: (filters: VendorFilters) => [...VENDOR_QUERY_KEYS.lists(), filters] as const,
  details: () => [...VENDOR_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...VENDOR_QUERY_KEYS.details(), id] as const,
  detailBySlug: (slug: string, filters?: ProductFilters) => [...VENDOR_QUERY_KEYS.details(), 'slug', slug, filters] as const,
  detailBySlugInfinite: (slug: string, filters?: Omit<ProductFilters, 'page'>) => [...VENDOR_QUERY_KEYS.details(), 'slug', 'infinite', slug, filters] as const,
};

/**
 * Hook to fetch all vendors with optional filters
 */
export function useVendors(filters: VendorFilters = {}) {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.list(filters),
    queryFn: () => vendorService.getAll(filters),
  });
}

/**
 * Hook to fetch a single vendor by ID
 */
export function useVendor(id: number) {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.detail(id),
    queryFn: () => vendorService.getById(id),
    enabled: !!id && id > 0,
  });
}

/**
 * Hook to fetch a single vendor by Slug
 */
export function useVendorBySlug(slug: string, filters: ProductFilters = {}) {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.detailBySlug(slug, filters),
    queryFn: () => vendorService.getBySlug(slug, filters),
    enabled: !!slug,
  });
}

/**
 * Hook to fetch a single vendor by Slug with infinite pagination for its products
 */
export function useInfiniteVendorBySlug(
  slug: string,
  filters: Omit<ProductFilters, 'page'> = {},
  options?: { enabled?: boolean; initialData?: VendorDetail; initialPage?: number },
) {
  const initialPage = options?.initialPage ?? options?.initialData?.productsMeta?.page ?? 1;

  return useInfiniteQuery({
    queryKey: VENDOR_QUERY_KEYS.detailBySlugInfinite(slug, filters),
    queryFn: ({ pageParam = 1 }) => vendorService.getBySlug(slug, { ...filters, page: pageParam }),
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
