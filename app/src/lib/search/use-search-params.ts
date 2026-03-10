'use client';

import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsFloat,
  parseAsArrayOf,
} from 'nuqs';
import type { SortOption } from './types';

export function useSearchFilters() {
  const [q,           setQ]           = useQueryState('q', parseAsString.withDefault(''));
  const [brand,       setBrand]       = useQueryState('brand', parseAsString);
  const [brandId,     setBrandId]     = useQueryState('brand_id', parseAsString);
  const [category,    setCategory]    = useQueryState('category', parseAsString);
  const [categoryIds, setCategoryIds] = useQueryState('category_ids', parseAsString);
  const [subcategory, setSubcategory] = useQueryState('subcategory', parseAsString);
  const [vendorId,    setVendorId]    = useQueryState('vendor_id', parseAsString);
  const [attrs,       setAttrs]       = useQueryState('attrs', parseAsArrayOf(parseAsString));
  const [minPrice,    setMinPrice]    = useQueryState('min_price', parseAsFloat);
  const [maxPrice,    setMaxPrice]    = useQueryState('max_price', parseAsFloat);
  const [sortBy,      setSortBy]      = useQueryState('sort_by', parseAsString.withDefault('popularity_score:desc'));
  const [page,        setPage]        = useQueryState('page', parseAsInteger.withDefault(1));

  function resetFilters() {
    void setBrand(null);
    void setBrandId(null);
    void setCategory(null);
    void setCategoryIds(null);
    void setSubcategory(null);
    void setVendorId(null);
    void setAttrs(null);
    void setMinPrice(null);
    void setMaxPrice(null);
    void setSortBy('popularity_score:desc');
    void setPage(1);
  }

  function changeFilter(key: string, value: string | string[] | null) {
    // Changing any filter resets to page 1
    void setPage(1);
    switch (key) {
      case 'brand':       return setBrand(value as string | null);
      case 'brand_id':    return setBrandId(value as string | null);
      case 'category':    return setCategory(value as string | null);
      case 'category_ids':return setCategoryIds(value as string | null);
      case 'subcategory': return setSubcategory(value as string | null);
      case 'vendor_id':   return setVendorId(value as string | null);
      case 'attrs':       return setAttrs(value as string[] | null);
    }
  }

  return {
    filters: {
      q,
      brand:       brand ?? undefined,
      brand_id:    brandId ?? undefined,
      category:    category ?? undefined,
      category_ids:categoryIds ?? undefined,
      subcategory: subcategory ?? undefined,
      vendor_id:   vendorId ?? undefined,
      attrs:       attrs ?? undefined,
      min_price:   minPrice ?? undefined,
      max_price:   maxPrice ?? undefined,
      sort_by:     (sortBy as SortOption) ?? 'popularity_score:desc',
      page,
    },
    setQ,
    setBrand,
    setBrandId,
    setCategory,
    setCategoryIds,
    setSubcategory,
    setVendorId,
    setAttrs,
    setMinPrice,
    setMaxPrice,
    setSortBy,
    setPage,
    resetFilters,
    changeFilter,
  };
}
