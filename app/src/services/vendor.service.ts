import { apiClient } from '@/lib/api-client';
import type { Vendor, VendorFilters, PaginatedResponse } from '@/types/api.types';

export const vendorService = {
  /**
   * Get all vendors with optional filters
   */
  getAll: (filters: VendorFilters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.status) params.append('status', filters.status);
    if (filters.visible !== undefined) params.append('visible', String(filters.visible));
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    return apiClient.get<PaginatedResponse<Vendor>>(`/vendors${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get a single vendor by ID
   */
  getById: (id: number) => {
    return apiClient.get<Vendor>(`/vendors/${id}`);
  },
};
