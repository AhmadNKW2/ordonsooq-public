import { apiClient } from '@/lib/api-client';
import type { SearchFilters, SearchResponse, AutocompleteResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

function buildSearchParams(filters: SearchFilters): string {
  const params = new URLSearchParams();

  if (filters.q) params.set('q', filters.q);

  if (filters.category_ids)         params.set('category_ids', filters.category_ids);
  if (filters.category)             params.set('category', filters.category);
  if (filters.subcategory)          params.set('subcategory', filters.subcategory);
  if (filters.brand_id)             params.set('brand_id', filters.brand_id);
  if (filters.brand)                params.set('brand', filters.brand);
  if (filters.vendor_id)            params.set('vendor_id', filters.vendor_id);
  
  if (filters.attrs && Array.isArray(filters.attrs)) {
    filters.attrs.forEach(attr => params.append('attrs', attr));
  }

  if (filters.min_price != null)    params.set('min_price', String(filters.min_price));
  if (filters.max_price != null)    params.set('max_price', String(filters.max_price));
  if (filters.sort_by)              params.set('sort_by', filters.sort_by);
  if (filters.page)                 params.set('page', String(filters.page));
  if (filters.per_page)             params.set('per_page', String(filters.per_page));

  return params.toString();
}

// ─── Server-side fetch (for Server Components — no auth needed) ─────────────

export async function serverSearch(filters: SearchFilters): Promise<SearchResponse> {
  const qs = buildSearchParams(filters);
  const res = await fetch(`${API_BASE}/search?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const json = await res.json();
  // API wraps results in a `data` envelope: { data: { hits, total, page, per_page, ... } }
  const payload = json?.data ?? json;
  return {
    ...payload,
    total_pages: payload.total_pages ?? Math.ceil((payload.total ?? 0) / (payload.per_page || 20)),
  } as SearchResponse;
}

// ─── Client-side fetch (uses apiClient for consistency) ─────────────────────

export async function clientSearch(filters: SearchFilters): Promise<SearchResponse> {
  const qs = buildSearchParams(filters);
  // apiClient unwraps the `data` envelope (no `meta` sibling) → gets { hits, total, page, per_page, ... }
  const payload = await apiClient.get<SearchResponse>(`/search?${qs}`);
  return {
    ...payload,
    total_pages: payload.total_pages ?? Math.ceil((payload.total ?? 0) / (payload.per_page || 20)),
  };
}

export async function clientAutocomplete(q: string, perPage = 8): Promise<AutocompleteResponse> {
  const params = new URLSearchParams({ q, per_page: String(perPage) });
  // apiClient unwraps `data` envelope → gets { suggestions: [...] }
  return apiClient.get<AutocompleteResponse>(`/search/autocomplete?${params}`);
}
