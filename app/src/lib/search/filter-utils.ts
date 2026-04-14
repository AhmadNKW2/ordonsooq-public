import type { ProductFilters } from "@/types/api.types";
import type { SearchFilters, SortOption } from "./types";

export type SearchFilterState = {
  q?: string;
  brand?: string;
  brand_id?: string;
  category?: string;
  category_ids?: string;
  subcategory?: string;
  vendor_id?: string;
  attrs?: string[];
  min_price?: number;
  max_price?: number;
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

export function searchParamsToSearchFilters(params: SearchParamsInput): SearchFilterState {
  return {
    q: firstString(params.q),
    brand: firstString(params.brand),
    brand_id: firstString(params.brand_id),
    category: firstString(params.category),
    category_ids: firstString(params.category_ids),
    subcategory: firstString(params.subcategory),
    vendor_id: firstString(params.vendor_id),
    attrs: stringArray(params.attrs),
    min_price: finiteNumber(params.min_price),
    max_price: finiteNumber(params.max_price),
    sort_by: (firstString(params.sort_by) as SortOption | undefined) ?? "popularity_score:desc",
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
    minPrice: filters.min_price,
    maxPrice: filters.max_price,
  };
}