'use client';

import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsFloat,
} from 'nuqs';
import type { SortOption } from './types';
import { searchFiltersToApiFilters as sharedSearchFiltersToApiFilters, type SearchFilterState } from './filter-utils';

export function useSearchFilters() {
  const [q,           setQ]           = useQueryState('q', parseAsString.withDefault(''));
  const [categoryIds, setCategoryIds] = useQueryState('category_ids', parseAsString);
  const [brandIds,    setBrandIds]    = useQueryState('brand_ids', parseAsString);
  const [vendorIds,   setVendorIds]   = useQueryState('vendor_ids', parseAsString);
  const [attributeValueIds, setAttributeValueIds] = useQueryState('attributes_values_ids', parseAsString);
  const [specificationValueIds, setSpecificationValueIds] = useQueryState('specifications_values_ids', parseAsString);
  const [minPrice,    setMinPrice]    = useQueryState('min_price', parseAsFloat);
  const [maxPrice,    setMaxPrice]    = useQueryState('max_price', parseAsFloat);
  const [isOutOfStockValue, setIsOutOfStockValue] = useQueryState('is_out_of_stock', parseAsString);
  const [averageRatingMin, setAverageRatingMin] = useQueryState('average_rating_min', parseAsFloat);
  const [sortBy,      setSortBy]      = useQueryState('sort_by', parseAsString.withDefault('popularity_score:desc'));
  const [page,        setPage]        = useQueryState('page', parseAsInteger.withDefault(1));

  const setIsOutOfStock = (value: boolean | null) => {
    return setIsOutOfStockValue(value == null ? null : String(value));
  };

  function resetFilters() {
    void setCategoryIds(null);
    void setBrandIds(null);
    void setVendorIds(null);
    void setAttributeValueIds(null);
    void setSpecificationValueIds(null);
    void setMinPrice(null);
    void setMaxPrice(null);
    void setIsOutOfStockValue(null);
    void setAverageRatingMin(null);
    void setSortBy('popularity_score:desc');
    void setPage(1);
  }

  function changeFilter(key: string, value: string | null) {
    // Changing any filter resets to page 1
    void setPage(1);
    switch (key) {
      case 'category_ids':return setCategoryIds(value as string | null);
      case 'brand_ids':   return setBrandIds(value as string | null);
      case 'vendor_ids':  return setVendorIds(value as string | null);
      case 'attributes_values_ids':
        return setAttributeValueIds(value as string | null);
      case 'specifications_values_ids':
        return setSpecificationValueIds(value as string | null);
    }
  }

  const parsedIsOutOfStock =
    isOutOfStockValue === 'true'
      ? true
      : isOutOfStockValue === 'false'
        ? false
        : undefined;

  return {
    filters: {
      q,
      category_ids: categoryIds ?? undefined,
      brand_ids: brandIds ?? undefined,
      vendor_ids: vendorIds ?? undefined,
      attributes_values_ids: attributeValueIds ?? undefined,
      specifications_values_ids: specificationValueIds ?? undefined,
      min_price:   minPrice ?? undefined,
      max_price:   maxPrice ?? undefined,
      is_out_of_stock: parsedIsOutOfStock,
      average_rating_min: averageRatingMin ?? undefined,
      sort_by:     (sortBy as SortOption) ?? 'popularity_score:desc',
      page,
    } satisfies SearchFilterState,
    setQ,
    setCategoryIds,
    setBrandIds,
    setVendorIds,
    setAttributeValueIds,
    setSpecificationValueIds,
    setMinPrice,
    setMaxPrice,
    setIsOutOfStock,
    setAverageRatingMin,
    setSortBy,
    setPage,
    resetFilters,
    changeFilter,
  };
}

export function searchFiltersToApiFilters(filters: ReturnType<typeof useSearchFilters>["filters"]) {
  return sharedSearchFiltersToApiFilters(filters);
}
