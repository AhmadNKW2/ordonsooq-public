import { apiClient } from '@/lib/api-client';
import type {
  Category,
  CategoryDetail,
  CategoryFilters,
  PaginatedResponse,
} from '@/types/api.types';

function buildQueryString(filters: CategoryFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const categoryService = {
  /**
   * Get paginated list of categories with optional filters
   */
  getAll: (filters: CategoryFilters = {}) => {
    const queryString = buildQueryString(filters);
    return apiClient.get<PaginatedResponse<Category>>(`/categories${queryString}`);
  },

  /**
   * Get a single category by ID with full details
   */
  getById: (id: number) => {
    return apiClient.get<CategoryDetail>(`/categories/${id}`);
  },

  /**
   * Get root categories (level 0)
   */
  getRootCategories: (filters: Omit<CategoryFilters, 'level' | 'parent_id'> = {}) => {
    return categoryService.getAll({ ...filters, level: 0 });
  },

  /**
   * Get subcategories by parent ID
   */
  getSubcategories: (parentId: number, filters: Omit<CategoryFilters, 'parent_id'> = {}) => {
    return categoryService.getAll({ ...filters, parent_id: parentId });
  },

  /**
   * Get categories by level
   */
  getByLevel: (level: number, filters: Omit<CategoryFilters, 'level'> = {}) => {
    return categoryService.getAll({ ...filters, level });
  },

  /**
   * Search categories
   */
  search: (query: string, filters: Omit<CategoryFilters, 'search'> = {}) => {
    return categoryService.getAll({ ...filters, search: query });
  },
};
