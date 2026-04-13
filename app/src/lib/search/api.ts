import { apiClient } from '@/lib/api-client';
import type {
  AutocompleteResponse,
  FacetCount,
  SearchFilters,
  SearchHit,
  SearchResponse,
  SortOption,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const ORDON_DB_SEARCH_URL = process.env.ORDON_DB_SEARCH_URL || process.env.NEXT_PUBLIC_ORDON_DB_SEARCH_URL || 'https://api1.bawwabs.com/api/SearchOrdonDBProduct';
const LOCAL_SEARCH_API_PATH = '/api/search';
const LOCAL_AUTOCOMPLETE_API_PATH = '/api/search/autocomplete';
const DEFAULT_PER_PAGE = 20;

type OrdonDbAttributeValue = {
  name_en?: string | null;
  name_ar?: string | null;
};

type OrdonDbAttributeGroup = {
  name_en?: string | null;
  name_ar?: string | null;
  values?: Record<string, OrdonDbAttributeValue>;
};

type OrdonDbCategory = {
  id?: number | string;
  name_en?: string | null;
  name_ar?: string | null;
  slug?: string | null;
};

type OrdonDbBrand = {
  id?: number | string;
  name_en?: string | null;
  name_ar?: string | null;
};

type OrdonDbVendor = {
  id?: number | string;
  name_en?: string | null;
  name_ar?: string | null;
};

type OrdonDbMedia = {
  url?: string | null;
  is_primary?: boolean | null;
  sort_order?: number | null;
};

type OrdonDbProduct = {
  id?: number | string;
  name_en?: string | null;
  name_ar?: string | null;
  created_at?: string | null;
  price?: number | string | null;
  sale_price?: number | string | null;
  is_out_of_stock?: boolean | null;
  average_rating?: number | string | null;
  brand?: OrdonDbBrand | null;
  vendor?: OrdonDbVendor | null;
  categories?: OrdonDbCategory[] | null;
  attributes?: Record<string, OrdonDbAttributeGroup> | null;
  media?: OrdonDbMedia[] | null;
};

type OrdonDbSearchResult = {
  id?: number | string;
  name?: string | null;
  name_ar?: string | null;
  product?: OrdonDbProduct | null;
  score?: number | string | null;
};

type OrdonDbSearchResponse = {
  results?: OrdonDbSearchResult[] | null;
};

type NormalizedOrdonDbItem = {
  hit: SearchHit;
  categoryIds: string[];
  categoryLabels: string[];
  categoryTokens: string[];
  brandTokens: string[];
  vendorFacetValue: string;
  vendorTokens: string[];
  attrPairs: string[];
  createdAtMs: number;
  effectivePrice: number;
};

export type SearchUpstreamSource = 'ordondb' | 'legacy';

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

function normalizeQuery(query?: string): string {
  const value = query?.trim();
  return !value || value === '*' ? '' : value;
}

function toFiniteNumber(value: unknown): number | undefined {
  const numericValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function splitFilterValues(value?: string): string[] {
  return value
    ?.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean) ?? [];
}

function normalizeToken(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return String(value).trim().toLowerCase();
}

function buildTokens(values: Array<unknown>): string[] {
  const tokenSet = new Set<string>();

  values.forEach((value) => {
    const token = normalizeToken(value);
    if (token) tokenSet.add(token);
  });

  return Array.from(tokenSet);
}

function sortMedia(media: OrdonDbMedia[] | null | undefined): OrdonDbMedia[] {
  if (!Array.isArray(media)) return [];

  return [...media].sort((left, right) => {
    const primaryDelta = Number(Boolean(right.is_primary)) - Number(Boolean(left.is_primary));
    if (primaryDelta !== 0) return primaryDelta;

    const leftOrder = left.sort_order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.sort_order ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder;
  });
}

function extractImages(product: OrdonDbProduct): string[] {
  return sortMedia(product.media)
    .map((item) => item.url?.trim())
    .filter((url): url is string => Boolean(url));
}

function buildAttributePairs(product: OrdonDbProduct): string[] {
  const pairSet = new Set<string>();

  Object.values(product.attributes ?? {}).forEach((attribute) => {
    const attributeNameEn = attribute?.name_en?.trim();
    if (!attributeNameEn) return;

    const attributeNameAr = attribute.name_ar?.trim() || attributeNameEn;

    Object.values(attribute.values ?? {}).forEach((value) => {
      const valueNameEn = value?.name_en?.trim();
      if (!valueNameEn) return;

      const valueNameAr = value.name_ar?.trim() || valueNameEn;
      pairSet.add(`${attributeNameEn}:${attributeNameAr}:${valueNameEn}:${valueNameAr}`);
    });
  });

  return Array.from(pairSet);
}

function normalizeOrdonDbItem(result: OrdonDbSearchResult): NormalizedOrdonDbItem | null {
  const product = result.product;
  if (!product?.id) return null;

  const price = toFiniteNumber(product.price) ?? 0;
  const salePrice = toFiniteNumber(product.sale_price);
  const effectivePrice = salePrice != null && salePrice < price ? salePrice : price;
  const categoryLabels = (product.categories ?? [])
    .map((category) => category.name_en?.trim() || category.name_ar?.trim() || category.slug?.trim() || String(category.id ?? '').trim())
    .filter(Boolean);

  const brandLabel = product.brand?.name_en?.trim() || product.brand?.name_ar?.trim() || '';
  const vendorLabel = product.vendor?.name_en?.trim() || product.vendor?.name_ar?.trim() || '';

  return {
    hit: {
      id: String(product.id),
      name_en: product.name_en?.trim() || result.name?.trim() || String(product.id),
      name_ar: product.name_ar?.trim() || result.name_ar?.trim() || product.name_en?.trim() || result.name?.trim() || String(product.id),
      brand: brandLabel,
      category: categoryLabels[0] || '',
      price,
      sale_price: salePrice,
      is_available: !product.is_out_of_stock,
      images: extractImages(product),
      rating: toFiniteNumber(product.average_rating),
      popularity_score: toFiniteNumber(result.score) ?? 0,
    },
    categoryIds: (product.categories ?? [])
      .map((category) => (category.id != null ? String(category.id) : ''))
      .filter(Boolean),
    categoryLabels,
    categoryTokens: buildTokens(
      (product.categories ?? []).flatMap((category) => [
        category.id,
        category.slug,
        category.name_en,
        category.name_ar,
      ])
    ),
    brandTokens: buildTokens([
      product.brand?.id,
      product.brand?.name_en,
      product.brand?.name_ar,
    ]),
    vendorFacetValue: product.vendor?.id != null ? String(product.vendor.id) : vendorLabel,
    vendorTokens: buildTokens([
      product.vendor?.id,
      product.vendor?.name_en,
      product.vendor?.name_ar,
    ]),
    attrPairs: buildAttributePairs(product),
    createdAtMs: Date.parse(product.created_at ?? '') || 0,
    effectivePrice,
  };
}

function matchesTokenFilter(filterValue: string | undefined, tokens: string[]): boolean {
  const selectedTokens = splitFilterValues(filterValue).map(normalizeToken).filter(Boolean);
  if (!selectedTokens.length) return true;
  return selectedTokens.some((selectedToken) => tokens.includes(selectedToken));
}

function matchesAttributeFilters(item: NormalizedOrdonDbItem, selectedAttrs: string[] | undefined): boolean {
  if (!selectedAttrs?.length) return true;

  return selectedAttrs.every((selectedAttr) => item.attrPairs.includes(selectedAttr));
}

function filterOrdonDbItems(items: NormalizedOrdonDbItem[], filters: SearchFilters): NormalizedOrdonDbItem[] {
  const minPrice = filters.min_price;
  const maxPrice = filters.max_price;

  return items.filter((item) => {
    if (!matchesTokenFilter(filters.category_ids, item.categoryIds)) return false;
    if (!matchesTokenFilter(filters.category, item.categoryTokens)) return false;
    if (!matchesTokenFilter(filters.subcategory, item.categoryTokens)) return false;
    if (!matchesTokenFilter(filters.brand_id, item.brandTokens)) return false;
    if (!matchesTokenFilter(filters.brand, item.brandTokens)) return false;
    if (!matchesTokenFilter(filters.vendor_id, item.vendorTokens)) return false;
    if (!matchesAttributeFilters(item, filters.attrs)) return false;
    if (minPrice != null && item.effectivePrice < minPrice) return false;
    if (maxPrice != null && item.effectivePrice > maxPrice) return false;

    return true;
  });
}

function sortOrdonDbItems(items: NormalizedOrdonDbItem[], sortBy?: SortOption): NormalizedOrdonDbItem[] {
  const sortedItems = [...items];

  sortedItems.sort((left, right) => {
    switch (sortBy) {
      case 'price:asc':
        return left.effectivePrice - right.effectivePrice || right.hit.popularity_score - left.hit.popularity_score;
      case 'price:desc':
        return right.effectivePrice - left.effectivePrice || right.hit.popularity_score - left.hit.popularity_score;
      case 'rating:desc':
        return (right.hit.rating ?? 0) - (left.hit.rating ?? 0) || right.hit.popularity_score - left.hit.popularity_score;
      case 'created_at:desc':
        return right.createdAtMs - left.createdAtMs || right.hit.popularity_score - left.hit.popularity_score;
      case 'popularity_score:desc':
      default:
        return right.hit.popularity_score - left.hit.popularity_score || right.createdAtMs - left.createdAtMs;
    }
  });

  return sortedItems;
}

function mapFacetCounts(countMap: Map<string, number>): FacetCount['counts'] {
  return Array.from(countMap.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([value, count]) => ({ value, count }));
}

function buildOrdonDbFacets(items: NormalizedOrdonDbItem[]): FacetCount[] {
  const categoryCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();
  const vendorCounts = new Map<string, number>();
  const attributeCounts = new Map<string, number>();

  items.forEach((item) => {
    item.categoryLabels.forEach((category) => {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    });

    if (item.hit.brand) {
      brandCounts.set(item.hit.brand, (brandCounts.get(item.hit.brand) ?? 0) + 1);
    }

    if (item.vendorFacetValue) {
      vendorCounts.set(item.vendorFacetValue, (vendorCounts.get(item.vendorFacetValue) ?? 0) + 1);
    }

    item.attrPairs.forEach((pair) => {
      attributeCounts.set(pair, (attributeCounts.get(pair) ?? 0) + 1);
    });
  });

  const facets: FacetCount[] = [];

  if (categoryCounts.size > 0) {
    facets.push({ field_name: 'category', counts: mapFacetCounts(categoryCounts) });
  }

  if (brandCounts.size > 0) {
    facets.push({ field_name: 'brand', counts: mapFacetCounts(brandCounts) });
  }

  if (vendorCounts.size > 0) {
    facets.push({ field_name: 'vendor', counts: mapFacetCounts(vendorCounts) });
  }

  if (attributeCounts.size > 0) {
    facets.push({ field_name: 'attributes', counts: mapFacetCounts(attributeCounts) });
  }

  return facets;
}

function normalizeOrdonDbSearchResponse(payload: OrdonDbSearchResponse, filters: SearchFilters): SearchResponse {
  if (!Array.isArray(payload?.results)) {
    throw new Error('Invalid SearchOrdonDBProduct response');
  }

  const normalizedItems = payload.results
    .map((result) => normalizeOrdonDbItem(result))
    .filter((item): item is NormalizedOrdonDbItem => Boolean(item));

  const filteredItems = filterOrdonDbItems(normalizedItems, filters);
  const sortedItems = sortOrdonDbItems(filteredItems, filters.sort_by);
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const perPage = filters.per_page && filters.per_page > 0 ? filters.per_page : DEFAULT_PER_PAGE;
  const startIndex = (page - 1) * perPage;
  const total = sortedItems.length;

  return {
    hits: sortedItems.slice(startIndex, startIndex + perPage).map((item) => item.hit),
    total,
    page,
    per_page: perPage,
    total_pages: total > 0 ? Math.ceil(total / perPage) : 0,
    facets: buildOrdonDbFacets(filteredItems),
  };
}

function normalizeOrdonDbAutocompleteResponse(
  payload: OrdonDbSearchResponse,
  perPage: number
): AutocompleteResponse {
  if (!Array.isArray(payload?.results)) {
    throw new Error('Invalid SearchOrdonDBProduct response');
  }

  const suggestions = payload.results
    .map((result) => normalizeOrdonDbItem(result))
    .filter((item): item is NormalizedOrdonDbItem => Boolean(item))
    .slice(0, perPage)
    .map((item) => ({
      id: item.hit.id,
      name_en: item.hit.name_en,
      name_ar: item.hit.name_ar,
      image: item.hit.images?.[0],
    }));

  return { suggestions };
}

async function fetchOrdonDbSearchPayload(query?: string): Promise<OrdonDbSearchResponse> {
  const response = await fetch(ORDON_DB_SEARCH_URL, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: normalizeQuery(query) }),
  });

  if (!response.ok) {
    throw new Error(`SearchOrdonDBProduct failed: ${response.status}`);
  }

  return response.json() as Promise<OrdonDbSearchResponse>;
}

async function requestOrdonDbSearch(filters: SearchFilters): Promise<SearchResponse> {
  const payload = await fetchOrdonDbSearchPayload(filters.q);
  return normalizeOrdonDbSearchResponse(payload, filters);
}

function shouldUseOrdonDbSearch(filters: SearchFilters): boolean {
  return typeof filters.q === 'string';
}

async function legacyServerSearch(filters: SearchFilters): Promise<SearchResponse> {
  const qs = buildSearchParams(filters);
  const res = await fetch(`${API_BASE}/search?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const json = await res.json();
  const payload = json?.data ?? json;

  return {
    ...payload,
    total_pages: payload.total_pages ?? Math.ceil((payload.total ?? 0) / (payload.per_page || DEFAULT_PER_PAGE)),
  } as SearchResponse;
}

async function legacyClientSearch(filters: SearchFilters): Promise<SearchResponse> {
  const qs = buildSearchParams(filters);
  const payload = await apiClient.get<SearchResponse>(`/search?${qs}`);

  return {
    ...payload,
    total_pages: payload.total_pages ?? Math.ceil((payload.total ?? 0) / (payload.per_page || DEFAULT_PER_PAGE)),
  };
}

async function legacyServerAutocomplete(q: string, perPage = 8): Promise<AutocompleteResponse> {
  const params = new URLSearchParams({ q, per_page: String(perPage) });
  const response = await fetch(`${API_BASE}/search/autocomplete?${params}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Autocomplete failed: ${response.status}`);
  }

  const jsonResponse = await response.json();
  if (jsonResponse && typeof jsonResponse === 'object' && 'data' in jsonResponse && !('meta' in jsonResponse)) {
    return jsonResponse.data as AutocompleteResponse;
  }

  return jsonResponse as AutocompleteResponse;
}

export async function serverAutocomplete(q: string, perPage = 8): Promise<AutocompleteResponse> {
  return (await serverAutocompleteWithSource(q, perPage)).data;
}

export async function serverAutocompleteWithSource(
  q: string,
  perPage = 8
): Promise<{ data: AutocompleteResponse; source: SearchUpstreamSource }> {
  const normalizedQ = q.trim();
  if (!normalizedQ) {
    return { data: { suggestions: [] }, source: 'ordondb' };
  }

  try {
    const payload = await fetchOrdonDbSearchPayload(normalizedQ);
    return {
      data: normalizeOrdonDbAutocompleteResponse(payload, perPage),
      source: 'ordondb',
    };
  } catch {
    return {
      data: await legacyServerAutocomplete(normalizedQ, perPage),
      source: 'legacy',
    };
  }
}

// ─── Server-side fetch (for Server Components — no auth needed) ─────────────

export async function serverSearch(filters: SearchFilters): Promise<SearchResponse> {
  return (await serverSearchWithSource(filters)).data;
}

export async function serverSearchWithSource(
  filters: SearchFilters
): Promise<{ data: SearchResponse; source: SearchUpstreamSource }> {
  if (!shouldUseOrdonDbSearch(filters)) {
    return {
      data: await legacyServerSearch(filters),
      source: 'legacy',
    };
  }

  try {
    return {
      data: await requestOrdonDbSearch(filters),
      source: 'ordondb',
    };
  } catch {
    return {
      data: await legacyServerSearch(filters),
      source: 'legacy',
    };
  }
}

// ─── Client-side fetch (uses apiClient for consistency) ─────────────────────

export async function clientSearch(filters: SearchFilters): Promise<SearchResponse> {
  const qs = buildSearchParams(filters);
  const response = await fetch(`${LOCAL_SEARCH_API_PATH}?${qs}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    return legacyClientSearch(filters);
  }

  return response.json() as Promise<SearchResponse>;
}

export async function clientAutocomplete(q: string, perPage = 8): Promise<AutocompleteResponse> {
  const normalizedQ = q.trim();
  if (!normalizedQ) return { suggestions: [] };

  const params = new URLSearchParams({ q: normalizedQ, per_page: String(perPage) });
  const response = await fetch(`${LOCAL_AUTOCOMPLETE_API_PATH}?${params}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    return legacyServerAutocomplete(normalizedQ, perPage);
  }

  return response.json() as Promise<AutocompleteResponse>;
}
