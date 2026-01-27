import { apiClient } from '@/lib/api-client';
import type {
  Product,
  ProductDetail,
  ProductFilters,
  PaginatedResponse,
} from '@/types/api.types';

function buildQueryString(filters: ProductFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const productService = {
  /**
   * Get paginated list of products with optional filters
   */
  getAll: (filters: ProductFilters = {}) => {
    const queryString = buildQueryString(filters);
    return apiClient.get<PaginatedResponse<Product>>(`/products${queryString}`);
  },

  /**
   * Get a single product by Slug with full details
   */
  getBySlug: (slug: string) => {
    return apiClient.get<ProductDetail>(`/products/slug/${slug}`);
  },

  /**
   * Get a single product by ID with full details
   */
  getById: (id: number) => {
    return apiClient.get<ProductDetail>(`/products/${id}`);
  },

  /**
   * Get products by category
   */
  getByCategory: (categoryId: number, filters: Omit<ProductFilters, 'categoryId'> = {}) => {
    return productService.getAll({ ...filters, categoryId });
  },

  /**
   * Get products by vendor
   */
  getByVendor: (vendorId: number, filters: Omit<ProductFilters, 'vendorId'> = {}) => {
    return productService.getAll({ ...filters, vendorId });
  },

  /**
   * Get products by brand
   */
  getByBrand: (brandId: number, filters: Omit<ProductFilters, 'brandId'> = {}) => {
    return productService.getAll({ ...filters, brandId });
  },

  /**
   * Search products
   */
  search: (query: string, filters: Omit<ProductFilters, 'search'> = {}) => {
    return productService.getAll({ ...filters, search: query });
  },
};
