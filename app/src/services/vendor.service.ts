import { apiClient } from '@/lib/api-client';
import type { Vendor, VendorDetail, VendorFilters, PaginatedResponse, ProductFilters } from '@/types/api.types';

function buildQueryString(filters: VendorFilters | ProductFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const vendorService = {
  /**
   * Get all vendors with optional filters
   */
  getAll: (filters: VendorFilters = {}) => {
    const queryString = buildQueryString(filters);
    return apiClient.get<PaginatedResponse<Vendor>>(`/vendors${queryString}`);
  },

  /**
   * Get a single vendor by Slug
   */
  getBySlug: (slug: string, filters: ProductFilters = {}) => {
    const queryString = buildQueryString(filters);
    return apiClient.get<VendorDetail>(`/vendors/slug/${slug}${queryString}`);
  },

  /**
   * Get a single vendor by ID
   */
  getById: (id: number) => {
    return apiClient.get<VendorDetail>(`/vendors/${id}`);
  },
};
