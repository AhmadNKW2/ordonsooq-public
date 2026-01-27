import { useQuery } from '@tanstack/react-query';
import { vendorService } from '@/services/vendor.service';
import type { VendorFilters } from '@/types/api.types';

export const VENDOR_QUERY_KEYS = {
  all: ['vendors'] as const,
  lists: () => [...VENDOR_QUERY_KEYS.all, 'list'] as const,
  list: (filters: VendorFilters) => [...VENDOR_QUERY_KEYS.lists(), filters] as const,
  details: () => [...VENDOR_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...VENDOR_QUERY_KEYS.details(), id] as const,
  detailBySlug: (slug: string) => [...VENDOR_QUERY_KEYS.details(), 'slug', slug] as const,
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
export function useVendorBySlug(slug: string) {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.detailBySlug(slug),
    queryFn: () => vendorService.getBySlug(slug),
    enabled: !!slug,
  });
}
