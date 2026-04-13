import { apiClient } from '@/lib/api-client';
import type {
  Product,
  ProductDetail,
  ProductFilters,
  PaginationMeta,
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

function toFiniteNumber(value: unknown): number | undefined {
  const numericValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function normalizePaginationMeta(
  rawMeta: unknown,
  itemCount: number,
  filters: ProductFilters
): PaginationMeta {
  const meta = rawMeta && typeof rawMeta === 'object'
    ? rawMeta as Partial<PaginationMeta> & {
        currentPage?: number;
        pageSize?: number;
        total_pages?: number;
        per_page?: number;
        totalCount?: number;
      }
    : {};

  const page =
    toFiniteNumber(meta.page) ??
    toFiniteNumber(meta.currentPage) ??
    toFiniteNumber(filters.page) ??
    1;

  const limit =
    toFiniteNumber(meta.limit) ??
    toFiniteNumber(meta.pageSize) ??
    toFiniteNumber(meta.per_page) ??
    toFiniteNumber(filters.limit) ??
    itemCount;

  const total =
    toFiniteNumber(meta.total) ??
    toFiniteNumber(meta.totalCount) ??
    itemCount;

  const safeLimit = limit > 0 ? limit : Math.max(itemCount, 1);
  const totalPages =
    toFiniteNumber(meta.totalPages) ??
    toFiniteNumber(meta.total_pages) ??
    Math.max(1, Math.ceil(total / safeLimit));

  return {
    total,
    page,
    limit: safeLimit,
    totalPages,
  };
}

function normalizePaginatedProductsResponse(
  rawResponse: unknown,
  filters: ProductFilters
): PaginatedResponse<Product> {
  if (Array.isArray(rawResponse)) {
    return {
      data: rawResponse as Product[],
      meta: normalizePaginationMeta(undefined, rawResponse.length, filters),
    };
  }

  if (!rawResponse || typeof rawResponse !== 'object') {
    return {
      data: [],
      meta: normalizePaginationMeta(undefined, 0, filters),
    };
  }

  const response = rawResponse as {
    data?: unknown;
    meta?: unknown;
    total?: unknown;
    page?: unknown;
    limit?: unknown;
    totalPages?: unknown;
    total_pages?: unknown;
    currentPage?: unknown;
    pageSize?: unknown;
    per_page?: unknown;
  };

  const data = Array.isArray(response.data)
    ? response.data as Product[]
    : [];

  const metaSource = response.meta ?? {
    total: response.total,
    page: response.page ?? response.currentPage,
    limit: response.limit ?? response.pageSize ?? response.per_page,
    totalPages: response.totalPages ?? response.total_pages,
  };

  return {
    data,
    meta: normalizePaginationMeta(metaSource, data.length, filters),
  };
}

export const productService = {
  /**
   * Get paginated list of products with optional filters
   */
  getAll: (filters: ProductFilters = {}) => {
    const queryString = buildQueryString(filters);
    return apiClient
      .get<unknown>(`/products${queryString}`)
      .then((response) => normalizePaginatedProductsResponse(response, filters));
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
