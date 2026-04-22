export interface SearchHit {
  id: string;
  slug?: string;
  name_en: string;
  name_ar: string;
  brand: string;
  category: string;
  price: number;
  sale_price?: number;
  is_available: boolean;
  images?: string[];
  rating?: number;
  stock?: number;
  createdAt?: string;
  popularity_score: number;
}

export interface FacetCountValue {
  value: string;
  count: number;
  label?: string;
  group_key?: string;
  group_label?: string;
}

export interface FacetCount {
  field_name: string;
  counts: FacetCountValue[];
}

export interface SearchResponse {
  hits: SearchHit[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  facets?: FacetCount[];
  search_time_ms?: number;
}

export interface AutocompleteSuggestion {
  id: string;
  slug?: string;
  name_en: string;
  name_ar: string;
  image?: string;
}

export interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[];
}

export type SortOption =
  | 'popularity_score:desc'
  | 'price:asc'
  | 'price:desc'
  | 'rating:desc'
  | 'created_at:desc';

export interface SearchFilters {
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
  per_page?: number;
}
