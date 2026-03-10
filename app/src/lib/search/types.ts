export interface SearchHit {
  id: string;
  name_en: string;
  name_ar: string;
  brand: string;
  category: string;
  price: number;
  sale_price?: number;
  is_available: boolean;
  images?: string[];
  rating?: number;
  popularity_score: number;
}

export interface FacetCount {
  field_name: string;
  counts: Array<{
    value: string;
    count: number;
  }>;
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
  category?: string;
  subcategory?: string;
  brand_id?: string;
  brand?: string;
  vendor_id?: string;
  attrs?: string[]; // allows multiple attrs=key:value
  min_price?: number;
  max_price?: number;
  sort_by?: SortOption;
  page?: number;
  per_page?: number;
}
