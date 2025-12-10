import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import type { ProductFilters } from '@/types/api.types';

export const PRODUCT_QUERY_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_QUERY_KEYS.all, 'list'] as const,
  list: (filters: ProductFilters) => [...PRODUCT_QUERY_KEYS.lists(), filters] as const,
  details: () => [...PRODUCT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PRODUCT_QUERY_KEYS.details(), id] as const,
  byCategory: (categoryId: number, filters?: Omit<ProductFilters, 'categoryId'>) =>
    [...PRODUCT_QUERY_KEYS.lists(), 'category', categoryId, filters] as const,
  byVendor: (vendorId: number, filters?: Omit<ProductFilters, 'vendorId'>) =>
    [...PRODUCT_QUERY_KEYS.lists(), 'vendor', vendorId, filters] as const,
  search: (query: string, filters?: Omit<ProductFilters, 'search'>) =>
    [...PRODUCT_QUERY_KEYS.lists(), 'search', query, filters] as const,
};

/**
 * Hook to fetch paginated products with filters
 */
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list(filters),
    queryFn: () => productService.getAll(filters),
  });
}

/**
 * Hook to fetch a single product by ID
 */
export function useProduct(id: number) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id && id > 0,
  });
}

/**
 * Hook to fetch products by category
 */
export function useProductsByCategory(
  categoryId: number,
  filters: Omit<ProductFilters, 'categoryId'> = {}
) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.byCategory(categoryId, filters),
    queryFn: () => productService.getByCategory(categoryId, filters),
    enabled: !!categoryId && categoryId > 0,
  });
}

/**
 * Hook to fetch products by vendor
 */
export function useProductsByVendor(
  vendorId: number,
  filters: Omit<ProductFilters, 'vendorId'> = {}
) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.byVendor(vendorId, filters),
    queryFn: () => productService.getByVendor(vendorId, filters),
    enabled: !!vendorId && vendorId > 0,
  });
}

/**
 * Hook to search products
 */
export function useProductSearch(
  query: string,
  filters: Omit<ProductFilters, 'search'> = {}
) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.search(query, filters),
    queryFn: () => productService.search(query, filters),
    enabled: query.length > 0,
  });
}

/**
 * Hook for infinite scrolling products
 */
export function useInfiniteProducts(filters: Omit<ProductFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...PRODUCT_QUERY_KEYS.lists(), 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      productService.getAll({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const { page } = firstPage.meta;
      return page > 1 ? page - 1 : undefined;
    },
  });
}
