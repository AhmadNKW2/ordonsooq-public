'use client';

import { useQuery } from '@tanstack/react-query';
import { clientSearch } from './api';
import type { SearchFilters, SearchResponse } from './types';

export const SEARCH_QUERY_KEYS = {
  all: ['search'] as const,
  results: (filters: SearchFilters) => [...SEARCH_QUERY_KEYS.all, 'results', filters] as const,
  autocomplete: (q: string) => [...SEARCH_QUERY_KEYS.all, 'autocomplete', q] as const,
};

export function useSearch(filters: SearchFilters, initialData?: SearchResponse | null) {
  return useQuery({
    queryKey: SEARCH_QUERY_KEYS.results(filters),
    queryFn: () => clientSearch(filters),
    enabled: !!filters.q.trim(),
    initialData: initialData ?? undefined,
    staleTime: 30_000, // 30s — search results stay fresh briefly
  });
}
