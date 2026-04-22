'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { clientSearch } from './api';
import type { SearchFilters, SearchResponse } from './types';

export const SEARCH_QUERY_KEYS = {
  all: ['search'] as const,
  results: (filters: SearchFilters, locale?: string) => [...SEARCH_QUERY_KEYS.all, 'results', locale ?? 'en', filters] as const,
  autocomplete: (q: string) => [...SEARCH_QUERY_KEYS.all, 'autocomplete', q] as const,
};

export function useSearch(filters: SearchFilters, initialData?: SearchResponse | null, options?: { locale?: string }) {
  return useQuery({
    queryKey: SEARCH_QUERY_KEYS.results(filters, options?.locale),
    queryFn: () => clientSearch(filters, options?.locale),
    initialData: initialData ?? undefined,
    staleTime: 30_000, // 30s
  });
}

export function useInfiniteSearchProducts(
  filters: Omit<SearchFilters, 'page'>,
  options?: {
    enabled?: boolean,
    initialData?: { pages: SearchResponse[]; pageParams: number[] },
    locale?: string,
  }
) {
  return useInfiniteQuery({
    queryKey: [...SEARCH_QUERY_KEYS.all, 'infinite', options?.locale ?? 'en', filters],
    queryFn: ({ pageParam = 1 }) => clientSearch({ ...filters, page: pageParam }, options?.locale),
    initialPageParam: 1,
    initialData: options?.initialData as any, // bypassing strict generic typing for brevity
    enabled: options?.enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
    getNextPageParam: (lastPage) => {
      const page = lastPage.page || 1;
      const totalPages = lastPage.total_pages || 1;
      return page < totalPages ? page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const page = firstPage.page || 1;
      return page > 1 ? page - 1 : undefined;
    },
  });
}

