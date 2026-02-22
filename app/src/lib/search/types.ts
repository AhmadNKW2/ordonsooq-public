export interface SearchHit {
  id: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  brand: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  price: number;
  sale_price?: number;
  rating?: number;
  rating_count?: number;
  stock_quantity: number;
  is_available: boolean;
  images?: string[];
  created_at: number;
  popularity_score: number;
  seller_id?: string;
  sales_count?: number;
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
  brand: string;
  category: string;
  price: number;
  images?: string[];
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
  q: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: SortOption;
  page?: number;
  per_page?: number;
}
