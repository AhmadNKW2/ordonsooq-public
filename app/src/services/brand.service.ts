import { apiClient } from '@/lib/api-client';
import type { Brand, BrandDetail, BrandFilters, PaginatedResponse, ProductFilters } from '@/types/api.types';

function buildQueryString(filters: BrandFilters | ProductFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const brandService = {
  /**
   * Get all brands with optional filters
   */
  getAll: (filters: BrandFilters = {}) => {
    const queryString = buildQueryString(filters);
    return apiClient.get<PaginatedResponse<Brand>>(`/brands${queryString}`);
  },

  /**
   * Get a single brand by Slug
   */
  getBySlug: (slug: string, filters: ProductFilters = {}) => {
    const queryString = buildQueryString(filters);
    return apiClient.get<BrandDetail>(`/brands/slug/${slug}${queryString}`);
  },

  /**
   * Get a single brand by ID
   */
  getById: (id: number) => {
    return apiClient.get<BrandDetail>(`/brands/${id}`);
  },
};
