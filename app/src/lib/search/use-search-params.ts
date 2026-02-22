'use client';

import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsFloat,
} from 'nuqs';
import type { SortOption } from './types';

export function useSearchFilters() {
  const [q,           setQ]           = useQueryState('q', parseAsString.withDefault(''));
  const [brand,       setBrand]       = useQueryState('brand', parseAsString);
  const [category,    setCategory]    = useQueryState('category', parseAsString);
  const [subcategory, setSubcategory] = useQueryState('subcategory', parseAsString);
  const [minPrice,    setMinPrice]    = useQueryState('min_price', parseAsFloat);
  const [maxPrice,    setMaxPrice]    = useQueryState('max_price', parseAsFloat);
  const [sortBy,      setSortBy]      = useQueryState('sort_by', parseAsString.withDefault('popularity_score:desc'));
  const [page,        setPage]        = useQueryState('page', parseAsInteger.withDefault(1));

  function resetFilters() {
    void setBrand(null);
    void setCategory(null);
    void setSubcategory(null);
    void setMinPrice(null);
    void setMaxPrice(null);
    void setSortBy('popularity_score:desc');
    void setPage(1);
  }

  function changeFilter(key: string, value: string | null) {
    // Changing any filter resets to page 1
    void setPage(1);
    switch (key) {
      case 'brand':       return setBrand(value);
      case 'category':    return setCategory(value);
      case 'subcategory': return setSubcategory(value);
    }
  }

  return {
    filters: {
      q,
      brand:       brand ?? undefined,
      category:    category ?? undefined,
      subcategory: subcategory ?? undefined,
      min_price:   minPrice ?? undefined,
      max_price:   maxPrice ?? undefined,
      sort_by:     (sortBy as SortOption) ?? 'popularity_score:desc',
      page,
    },
    setQ,
    setBrand,
    setCategory,
    setSubcategory,
    setMinPrice,
    setMaxPrice,
    setSortBy,
    setPage,
    resetFilters,
    changeFilter,
  };
}
