import { useQuery } from '@tanstack/react-query';
import { brandService } from '@/services/brand.service';
import type { BrandFilters } from '@/types/api.types';

export const BRAND_QUERY_KEYS = {
  all: ['brands'] as const,
  lists: () => [...BRAND_QUERY_KEYS.all, 'list'] as const,
  list: (filters: BrandFilters) => [...BRAND_QUERY_KEYS.lists(), filters] as const,
  details: () => [...BRAND_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...BRAND_QUERY_KEYS.details(), id] as const,
  detailBySlug: (slug: string) => [...BRAND_QUERY_KEYS.details(), 'slug', slug] as const,
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
export function useBrandBySlug(slug: string) {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.detailBySlug(slug),
    queryFn: () => brandService.getBySlug(slug),
    enabled: !!slug,
  });
}
