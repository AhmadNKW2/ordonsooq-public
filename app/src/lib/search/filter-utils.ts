import type { ProductFilters } from "@/types/api.types";
import type { SearchFilters, SortOption } from "./types";

export type SearchFilterState = {
  q?: string;
  category_ids?: string;
  brand_ids?: string;
  vendor_ids?: string;
  attributes_values_ids?: string;
  specifications_values_ids?: string;
  min_price?: number;
  max_price?: number;
  is_out_of_stock?: boolean;
  average_rating_min?: number;
  sort_by?: SortOption;
  page?: number;
};

type SearchParamsInput = Record<string, string | string[] | undefined>;

function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function stringArray(value: string | string[] | undefined): string[] | undefined {
  if (Array.isArray(value)) {
    return value.length > 0 ? value : undefined;
  }

  if (typeof value === "string" && value.trim() !== "") {
    return [value];
  }

  return undefined;
}

function finiteNumber(value: string | string[] | undefined): number | undefined {
  const rawValue = firstString(value);

  if (!rawValue) {
    return undefined;
  }

  const numericValue = Number(rawValue);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function booleanValue(value: string | string[] | undefined): boolean | undefined {
  const rawValue = firstString(value)?.trim().toLowerCase();

  if (rawValue === "true") return true;
  if (rawValue === "false") return false;

  return undefined;
}

export function splitFilterValues(value?: string): string[] {
  return value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) ?? [];
}

export function joinFilterValues(values: string[]): string | null {
  const normalizedValues = values.map((value) => value.trim()).filter(Boolean);
  return normalizedValues.length > 0 ? normalizedValues.join(",") : null;
}

function firstNumericFilterValue(value?: string): number | undefined {
  const firstValue = splitFilterValues(value)[0];
  if (!firstValue) return undefined;

  const numericValue = Number(firstValue);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

export function searchParamsToSearchFilters(params: SearchParamsInput): SearchFilterState {
  return {
    q: firstString(params.q),
    category_ids: firstString(params.category_ids),
    brand_ids: firstString(params.brand_ids) ?? firstString(params.brand_id),
    vendor_ids: firstString(params.vendor_ids) ?? firstString(params.vendor_id),
    attributes_values_ids: firstString(params.attributes_values_ids),
    specifications_values_ids: firstString(params.specifications_values_ids),
    min_price: finiteNumber(params.min_price),
    max_price: finiteNumber(params.max_price),
    is_out_of_stock: booleanValue(params.is_out_of_stock),
    average_rating_min: finiteNumber(params.average_rating_min),
    sort_by: firstString(params.sort_by) as SortOption | undefined,
    page: finiteNumber(params.page) ?? 1,
  };
}

export function searchFiltersToApiFilters(filters: SearchFilterState, limit = 24): ProductFilters {
  const sortParts = filters.sort_by ? filters.sort_by.split(":") : ["average_rating", "desc"];
  let sortBy = sortParts[0];

  if (sortBy === "popularity_score") sortBy = "average_rating";
  if (sortBy === "rating") sortBy = "average_rating";

  return {
    page: filters.page,
    limit,
    sortBy: sortBy as ProductFilters["sortBy"],
    sortOrder: (sortParts[1] || "DESC").toUpperCase() as ProductFilters["sortOrder"],
    categoryId: firstNumericFilterValue(filters.category_ids),
    brandId: firstNumericFilterValue(filters.brand_ids),
    vendorId: firstNumericFilterValue(filters.vendor_ids),
    minPrice: filters.min_price,
    maxPrice: filters.max_price,
    minRating: filters.average_rating_min,
    search: filters.q && filters.q !== "*" ? filters.q : undefined,
  };
}