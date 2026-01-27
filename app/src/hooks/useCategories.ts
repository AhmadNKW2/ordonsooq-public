import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import type { CategoryFilters } from '@/types/api.types';

export const CATEGORY_QUERY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORY_QUERY_KEYS.all, 'list'] as const,
  list: (filters: CategoryFilters) => [...CATEGORY_QUERY_KEYS.lists(), filters] as const,
  details: () => [...CATEGORY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CATEGORY_QUERY_KEYS.details(), id] as const,
  detailBySlug: (slug: string) => [...CATEGORY_QUERY_KEYS.details(), 'slug', slug] as const,
  root: (filters?: Omit<CategoryFilters, 'level' | 'parent_id'>) =>
    [...CATEGORY_QUERY_KEYS.lists(), 'root', filters] as const,
  subcategories: (parentId: number, filters?: Omit<CategoryFilters, 'parent_id'>) =>
    [...CATEGORY_QUERY_KEYS.lists(), 'subcategories', parentId, filters] as const,
  byLevel: (level: number, filters?: Omit<CategoryFilters, 'level'>) =>
    [...CATEGORY_QUERY_KEYS.lists(), 'level', level, filters] as const,
  search: (query: string, filters?: Omit<CategoryFilters, 'search'>) =>
    [...CATEGORY_QUERY_KEYS.lists(), 'search', query, filters] as const,
};

/**
 * Hook to fetch paginated categories with filters
 */
export function useCategories(filters: CategoryFilters = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list(filters),
    queryFn: () => categoryService.getAll(filters),
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch a single category by ID
 */
export function useCategory(id: number) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.detail(id),
    queryFn: () => categoryService.getById(id),
    enabled: !!id && id > 0,
  });
}

/**
 * Hook to fetch a single category by Slug
 */
export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.detailBySlug(slug),
    queryFn: () => categoryService.getBySlug(slug),
    enabled: !!slug,
  });
}

/**
 * Hook to fetch root categories (level 0)
 */
export function useRootCategories(
  filters: Omit<CategoryFilters, 'level' | 'parent_id'> = {}
) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.root(filters),
    queryFn: () => categoryService.getRootCategories(filters),
  });
}

/**
 * Hook to fetch subcategories by parent ID
 */
export function useSubcategories(
  parentId: number,
  filters: Omit<CategoryFilters, 'parent_id'> = {}
) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.subcategories(parentId, filters),
    queryFn: () => categoryService.getSubcategories(parentId, filters),
    enabled: !!parentId && parentId > 0,
  });
}

/**
 * Hook to fetch categories by level
 */
export function useCategoriesByLevel(
  level: number,
  filters: Omit<CategoryFilters, 'level'> = {}
) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.byLevel(level, filters),
    queryFn: () => categoryService.getByLevel(level, filters),
  });
}

/**
 * Hook to search categories
 */
export function useCategorySearch(
  query: string,
  filters: Omit<CategoryFilters, 'search'> = {}
) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.search(query, filters),
    queryFn: () => categoryService.search(query, filters),
    enabled: query.length > 0,
  });
}
