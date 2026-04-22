import { debugFetch, logSearchDebug } from '@/lib/debug-fetch';
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
  values?: Record<string, OrdonDbAttributeValue | undefined> | null;
};

type OrdonDbMedia = {
  url?: string | null;
  is_primary?: boolean | null;
  sort_order?: number | null;
};

type OrdonDbCategory = {
  id?: number | string | null;
  name_en?: string | null;
  name_ar?: string | null;
  slug?: string | null;
};

type OrdonDbEntitySummary = {
  id?: number | string | null;
  name_en?: string | null;
  name_ar?: string | null;
};

type OrdonDbProduct = {
  id?: number | string | null;
  slug?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  price?: number | string | null;
  sale_price?: number | string | null;
  quantity?: number | string | null;
  average_rating?: number | string | null;
  is_out_of_stock?: boolean | null;
  created_at?: string | null;
  brand?: OrdonDbEntitySummary | null;
  vendor?: OrdonDbEntitySummary | null;
  categories?: OrdonDbCategory[] | null;
  categories_ids?: Array<number | string> | null;
  attributes?: Record<string, OrdonDbAttributeGroup> | null;
  specifications?: Record<string, OrdonDbAttributeGroup> | null;
  media?: OrdonDbMedia[] | null;
};

type OrdonDbSearchResult = {
  name?: string | null;
  name_ar?: string | null;
  product?: OrdonDbProduct | null;
  score?: number | string | null;
};

type OrdonDbSearchResponse = {
  expanded_queries?: string[] | null;
  results?: OrdonDbSearchResult[] | null;
  pagination?: {
    page?: number | null;
    page_size?: number | null;
    total?: number | null;
    total_pages?: number | null;
    has_next?: boolean | null;
    has_prev?: boolean | null;
  } | null;
  filter_options?: {
    brand_ids?: Array<number | string> | null;
    vendor_ids?: Array<number | string> | null;
    categories_ids?: Array<number | string> | null;
    attributes_ids?: Array<number | string> | null;
    attributes_values_ids?: Array<number | string> | null;
    specifications_ids?: Array<number | string> | null;
    specifications_values_ids?: Array<number | string> | null;
  } | null;
  product_length?: Partial<Record<
    'brand_ids' | 'vendor_ids' | 'categories_ids' | 'attributes_ids' | 'attributes_values_ids' | 'specifications_ids' | 'specifications_values_ids',
    Record<string, number>
  >> | null;
};

type OrdonDbSearchRequest = {
  query: string;
  filters?: {
    brand_ids?: number[];
    vendor_ids?: number[];
    categories_ids?: number[];
    attributes_values_ids?: number[];
    specifications_values_ids?: number[];
    price?: {
      min: number | null;
      max: number | null;
      eq: number | null;
    };
    is_out_of_stock?: boolean;
    average_rating?: {
      min: number | null;
      max: number | null;
      eq: number | null;
    };
  };
  sort?: {
    key: 'created_at' | 'price' | 'average_rating';
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    per_page: number;
  };
};

type SearchFacetMeta = {
  id: string;
  label: string;
  groupKey?: string;
  groupLabel?: string;
};

type SearchLocale = 'ar' | 'en';

type PublicCategoryNode = {
  id?: number | string;
  name_en?: string | null;
  name_ar?: string | null;
  children?: PublicCategoryNode[] | null;
};

type PublicEntitySummary = {
  id?: number | string;
  name_en?: string | null;
  name_ar?: string | null;
};

type PublicAttributeValueNode = {
  id?: number | string;
  value_en?: string | null;
  value_ar?: string | null;
};

type PublicAttributeNode = {
  id?: number | string;
  name_en?: string | null;
  name_ar?: string | null;
  values?: PublicAttributeValueNode[] | null;
};

type FacetCatalogs = {
  categories: Map<string, SearchFacetMeta>;
  brands: Map<string, SearchFacetMeta>;
  vendors: Map<string, SearchFacetMeta>;
  attributeValues: Map<string, SearchFacetMeta>;
};

type FacetFieldBuildOptions = {
  fallbackLookup?: Map<string, SearchFacetMeta>;
  hideUnresolvedNumericValues?: boolean;
};

type NormalizedOrdonDbItem = {
  hit: SearchHit;
  categories: SearchFacetMeta[];
  brand?: SearchFacetMeta;
  vendor?: SearchFacetMeta;
  attributeValues: SearchFacetMeta[];
  specificationValues: SearchFacetMeta[];
  isOutOfStock: boolean;
  rating: number;
};

export type SearchUpstreamSource = 'ordondb' | 'legacy';

export type SearchRequestDebugResult<T> = {
  data: T;
  rawData: unknown;
  source: SearchUpstreamSource;
  status: number;
  durationMs: number;
};

type DisjunctiveFacetRequest = {
  fieldName: FacetCount['field_name'];
  filters: SearchFilters;
  groupKeys?: string[];
};

const FACET_CATALOG_TTL_MS = 5 * 60 * 1000;

const EMPTY_FACET_CATALOGS: FacetCatalogs = {
  categories: new Map(),
  brands: new Map(),
  vendors: new Map(),
  attributeValues: new Map(),
};

const facetCatalogCache = new Map<SearchLocale, {
  expiresAt: number;
  value: FacetCatalogs;
}>();

const facetCatalogPromises = new Map<SearchLocale, Promise<FacetCatalogs>>();

function buildSearchParams(filters: SearchFilters, locale?: string, options?: { includeLocale?: boolean }): string {
  const params = new URLSearchParams();

  if (filters.q) params.set('q', filters.q);

  if (filters.category_ids)               params.set('category_ids', filters.category_ids);
  if (filters.brand_ids)                  params.set('brand_ids', filters.brand_ids);
  if (filters.vendor_ids)                 params.set('vendor_ids', filters.vendor_ids);
  if (filters.attributes_values_ids)      params.set('attributes_values_ids', filters.attributes_values_ids);
  if (filters.specifications_values_ids)  params.set('specifications_values_ids', filters.specifications_values_ids);

  if (filters.min_price != null)    params.set('min_price', String(filters.min_price));
  if (filters.max_price != null)    params.set('max_price', String(filters.max_price));
  if (filters.is_out_of_stock != null) params.set('is_out_of_stock', String(filters.is_out_of_stock));
  if (filters.average_rating_min != null) params.set('average_rating_min', String(filters.average_rating_min));
  if (filters.sort_by && filters.sort_by !== 'popularity_score:desc') {
    params.set('sort_by', filters.sort_by);
  }
  if (filters.page)                 params.set('page', String(filters.page));
  if (filters.per_page)             params.set('per_page', String(filters.per_page));
  if (options?.includeLocale && locale) params.set('locale', locale);

  return params.toString();
}

function normalizeQuery(query?: string): string {
  const value = query?.trim();
  return value && value.length > 0 ? value : '*';
}

function normalizeSearchLocale(locale?: string): SearchLocale {
  return locale?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

function getLocalizedText(
  locale: SearchLocale,
  englishValue: unknown,
  arabicValue: unknown,
  fallbackValue: unknown
): string {
  const primaryValue = locale === 'ar' ? arabicValue : englishValue;
  const secondaryValue = locale === 'ar' ? englishValue : arabicValue;

  if (typeof primaryValue === 'string' && primaryValue.trim()) {
    return primaryValue.trim();
  }

  if (typeof secondaryValue === 'string' && secondaryValue.trim()) {
    return secondaryValue.trim();
  }

  return String(fallbackValue ?? '').trim();
}

function createCatalogUrl(path: string, params?: Record<string, string | number | undefined>): string | null {
  if (!API_BASE) return null;

  const url = new URL(path.replace(/^\//, ''), API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value == null) return;
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function unwrapApiListPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data as T[];
  }

  return [];
}

function toFacetLabel(locale: SearchLocale, englishValue: unknown, arabicValue: unknown, fallbackId: unknown): string {
  return getLocalizedText(locale, englishValue, arabicValue, fallbackId);
}

function mergeFacetLookups(
  primaryLookup: Map<string, SearchFacetMeta>,
  fallbackLookup?: Map<string, SearchFacetMeta>
): Map<string, SearchFacetMeta> {
  if (!fallbackLookup || fallbackLookup.size === 0) {
    return primaryLookup;
  }

  const mergedLookup = new Map(fallbackLookup);

  primaryLookup.forEach((value, key) => {
    mergedLookup.set(key, value);
  });

  return mergedLookup;
}

function collectCategoryNodes(
  nodes: PublicCategoryNode[],
  locale: SearchLocale,
  lookup = new Map<string, SearchFacetMeta>()
): Map<string, SearchFacetMeta> {
  nodes.forEach((node) => {
    const normalizedId = String(node.id ?? '').trim();

    if (normalizedId && !lookup.has(normalizedId)) {
      lookup.set(normalizedId, {
        id: normalizedId,
        label: toFacetLabel(locale, node.name_en, node.name_ar, normalizedId),
      });
    }

    if (Array.isArray(node.children) && node.children.length > 0) {
      collectCategoryNodes(node.children, locale, lookup);
    }
  });

  return lookup;
}

function collectEntityNodes(nodes: PublicEntitySummary[], locale: SearchLocale): Map<string, SearchFacetMeta> {
  return nodes.reduce((lookup, node) => {
    const normalizedId = String(node.id ?? '').trim();

    if (!normalizedId || lookup.has(normalizedId)) {
      return lookup;
    }

    lookup.set(normalizedId, {
      id: normalizedId,
      label: toFacetLabel(locale, node.name_en, node.name_ar, normalizedId),
    });

    return lookup;
  }, new Map<string, SearchFacetMeta>());
}

function collectAttributeValueNodes(nodes: PublicAttributeNode[], locale: SearchLocale): Map<string, SearchFacetMeta> {
  return nodes.reduce((lookup, node) => {
    const groupKey = String(node.id ?? '').trim();
    const groupLabel = toFacetLabel(locale, node.name_en, node.name_ar, groupKey);

    (node.values ?? []).forEach((valueNode) => {
      const normalizedId = String(valueNode.id ?? '').trim();

      if (!normalizedId || lookup.has(normalizedId)) {
        return;
      }

      lookup.set(normalizedId, {
        id: normalizedId,
        label: toFacetLabel(locale, valueNode.value_en, valueNode.value_ar, normalizedId),
        groupKey,
        groupLabel,
      });
    });

    return lookup;
  }, new Map<string, SearchFacetMeta>());
}

async function fetchCatalogEntries<T>(name: string, url: string | null): Promise<T[]> {
  if (!url) return [];

  try {
    const response = await debugFetch<unknown>(name, url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    return unwrapApiListPayload<T>(response.data);
  } catch {
    return [];
  }
}

async function loadFacetCatalogs(locale: SearchLocale): Promise<FacetCatalogs> {
  const now = Date.now();
  const cachedCatalog = facetCatalogCache.get(locale);

  if (cachedCatalog && cachedCatalog.expiresAt > now) {
    return cachedCatalog.value;
  }

  const existingPromise = facetCatalogPromises.get(locale);

  if (existingPromise) {
    return existingPromise;
  }

  const nextPromise = (async () => {
    const [categories, brands, vendors, attributes] = await Promise.all([
      fetchCatalogEntries<PublicCategoryNode>('SearchFacetCategoriesCatalog', createCatalogUrl('/categories', { limit: 500 })),
      fetchCatalogEntries<PublicEntitySummary>('SearchFacetBrandsCatalog', createCatalogUrl('/brands', { limit: 500 })),
      fetchCatalogEntries<PublicEntitySummary>('SearchFacetVendorsCatalog', createCatalogUrl('/vendors', { limit: 500 })),
      fetchCatalogEntries<PublicAttributeNode>('SearchFacetAttributesCatalog', createCatalogUrl('/attributes')),
    ]);

    const catalogs: FacetCatalogs = {
      categories: collectCategoryNodes(categories, locale),
      brands: collectEntityNodes(brands, locale),
      vendors: collectEntityNodes(vendors, locale),
      attributeValues: collectAttributeValueNodes(attributes, locale),
    };

    facetCatalogCache.set(locale, {
      expiresAt: Date.now() + FACET_CATALOG_TTL_MS,
      value: catalogs,
    });

    return catalogs;
  })();

  facetCatalogPromises.set(locale, nextPromise);

  try {
    return await nextPromise;
  } catch {
    return EMPTY_FACET_CATALOGS;
  } finally {
    facetCatalogPromises.delete(locale);
  }
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

function buildFacetSearchFilters(filters: SearchFilters, overrides: Partial<SearchFilters>): SearchFilters {
  return {
    ...filters,
    ...overrides,
    page: 1,
  };
}

function joinFilterValues(values: string[]): string | undefined {
  return values.length > 0 ? values.join(',') : undefined;
}

function buildFacetValueGroupLookup(facet: FacetCount | undefined): Map<string, string> {
  const lookup = new Map<string, string>();

  facet?.counts.forEach((item) => {
    if (!item.group_key) return;
    lookup.set(item.value, item.group_key);
  });

  return lookup;
}

function buildMetaValueGroupLookup(entries: Iterable<SearchFacetMeta>): Map<string, string> {
  const lookup = new Map<string, string>();

  for (const entry of entries) {
    if (!entry.id || !entry.groupKey) {
      continue;
    }

    lookup.set(entry.id, entry.groupKey);
  }

  return lookup;
}

function mergeValueGroupLookups(...lookups: Array<Map<string, string> | undefined>): Map<string, string> {
  const mergedLookup = new Map<string, string>();

  lookups.forEach((lookup) => {
    lookup?.forEach((value, key) => {
      if (!mergedLookup.has(key)) {
        mergedLookup.set(key, value);
      }
    });
  });

  return mergedLookup;
}

function countSelectedGroupKeys(selectedValueString: string | undefined, valueGroupLookup: Map<string, string>): number {
  const selectedValues = splitFilterValues(selectedValueString);
  const groupKeys = new Set<string>();

  selectedValues.forEach((value) => {
    groupKeys.add(valueGroupLookup.get(value) ?? `__value:${value}`);
  });

  return groupKeys.size;
}

function shouldApplyGroupedAndFiltering(
  filters: SearchFilters,
  facets: FacetCount[] | undefined,
  catalogs: FacetCatalogs
): boolean {
  const attributeFacet = facets?.find((facet) => facet.field_name === 'attributes_values_ids');
  const specificationFacet = facets?.find((facet) => facet.field_name === 'specifications_values_ids');
  const attributeLookup = mergeValueGroupLookups(
    buildFacetValueGroupLookup(attributeFacet),
    buildMetaValueGroupLookup(catalogs.attributeValues.values())
  );
  const specificationLookup = buildFacetValueGroupLookup(specificationFacet);

  return countSelectedGroupKeys(filters.attributes_values_ids, attributeLookup) > 1
    || countSelectedGroupKeys(filters.specifications_values_ids, specificationLookup) > 1;
}

function buildSelectedGroupSelections(
  selectedValueString: string | undefined,
  valueGroupLookup: Map<string, string>
): Map<string, Set<string>> {
  const selectedGroupSelections = new Map<string, Set<string>>();

  splitFilterValues(selectedValueString).forEach((value) => {
    const groupKey = valueGroupLookup.get(value) ?? `__value:${value}`;
    const existingValues = selectedGroupSelections.get(groupKey) ?? new Set<string>();
    existingValues.add(value);
    selectedGroupSelections.set(groupKey, existingValues);
  });

  return selectedGroupSelections;
}

function matchesGroupedSelections(
  entries: SearchFacetMeta[],
  selectedGroupSelections: Map<string, Set<string>>
): boolean {
  if (selectedGroupSelections.size === 0) {
    return true;
  }

  const itemGroupValues = new Map<string, Set<string>>();

  entries.forEach((entry) => {
    const groupKey = entry.groupKey ?? `__value:${entry.id}`;
    const groupValues = itemGroupValues.get(groupKey) ?? new Set<string>();
    groupValues.add(entry.id);
    itemGroupValues.set(groupKey, groupValues);
  });

  return Array.from(selectedGroupSelections.entries()).every(([groupKey, selectedValues]) => {
    const itemValues = itemGroupValues.get(groupKey);

    if (!itemValues) {
      return false;
    }

    return Array.from(selectedValues).some((selectedValue) => itemValues.has(selectedValue));
  });
}

function filterItemsByGroupedSelections(
  items: NormalizedOrdonDbItem[],
  filters: SearchFilters,
  facets: FacetCount[] | undefined,
  catalogs: FacetCatalogs
): NormalizedOrdonDbItem[] {
  const attributeFacet = facets?.find((facet) => facet.field_name === 'attributes_values_ids');
  const specificationFacet = facets?.find((facet) => facet.field_name === 'specifications_values_ids');
  const attributeLookup = mergeValueGroupLookups(
    buildFacetValueGroupLookup(attributeFacet),
    buildMetaValueGroupLookup(catalogs.attributeValues.values()),
    buildMetaValueGroupLookup(items.flatMap((item) => item.attributeValues))
  );
  const specificationLookup = mergeValueGroupLookups(
    buildFacetValueGroupLookup(specificationFacet),
    buildMetaValueGroupLookup(items.flatMap((item) => item.specificationValues))
  );
  const selectedAttributeGroups = buildSelectedGroupSelections(filters.attributes_values_ids, attributeLookup);
  const selectedSpecificationGroups = buildSelectedGroupSelections(filters.specifications_values_ids, specificationLookup);

  return items.filter((item) => (
    matchesGroupedSelections(item.attributeValues, selectedAttributeGroups)
    && matchesGroupedSelections(item.specificationValues, selectedSpecificationGroups)
  ));
}

function buildGroupedDisjunctiveFacetRequests(
  filters: SearchFilters,
  fieldName: 'attributes_values_ids' | 'specifications_values_ids',
  selectedValueString: string | undefined,
  facet: FacetCount | undefined
): DisjunctiveFacetRequest[] {
  const selectedValues = splitFilterValues(selectedValueString);

  if (selectedValues.length === 0) {
    return [];
  }

  const valueGroupLookup = buildFacetValueGroupLookup(facet);
  const selectedGroupKeys = Array.from(new Set(
    selectedValues
      .map((value) => valueGroupLookup.get(value))
      .filter((groupKey): groupKey is string => Boolean(groupKey))
  ));

  if (selectedGroupKeys.length === 0) {
    return [
      {
        fieldName,
        filters: buildFacetSearchFilters(filters, {
          [fieldName]: undefined,
        } as Partial<SearchFilters>),
      },
    ];
  }

  return selectedGroupKeys.map((groupKey) => {
    const remainingValues = selectedValues.filter((value) => valueGroupLookup.get(value) !== groupKey);

    return {
      fieldName,
      groupKeys: [groupKey],
      filters: buildFacetSearchFilters(filters, {
        [fieldName]: joinFilterValues(remainingValues),
      } as Partial<SearchFilters>),
    };
  });
}

function buildCategoryFacetSearchFilters(filters: SearchFilters): SearchFilters {
  return buildFacetSearchFilters(filters, { category_ids: undefined });
}

function buildDisjunctiveFacetRequests(filters: SearchFilters, facets: FacetCount[] | undefined): DisjunctiveFacetRequest[] {
  const requests: DisjunctiveFacetRequest[] = [];
  const attributeFacet = facets?.find((facet) => facet.field_name === 'attributes_values_ids');
  const specificationFacet = facets?.find((facet) => facet.field_name === 'specifications_values_ids');

  if (splitFilterValues(filters.category_ids).length > 0) {
    requests.push({
      fieldName: 'categories_ids',
      filters: buildCategoryFacetSearchFilters(filters),
    });
  }

  if (splitFilterValues(filters.brand_ids).length > 0) {
    requests.push({
      fieldName: 'brand_ids',
      filters: buildFacetSearchFilters(filters, { brand_ids: undefined }),
    });
  }

  if (splitFilterValues(filters.vendor_ids).length > 0) {
    requests.push({
      fieldName: 'vendor_ids',
      filters: buildFacetSearchFilters(filters, { vendor_ids: undefined }),
    });
  }

  requests.push(
    ...buildGroupedDisjunctiveFacetRequests(
      filters,
      'attributes_values_ids',
      filters.attributes_values_ids,
      attributeFacet,
    )
  );

  requests.push(
    ...buildGroupedDisjunctiveFacetRequests(
      filters,
      'specifications_values_ids',
      filters.specifications_values_ids,
      specificationFacet,
    )
  );

  if (filters.is_out_of_stock != null) {
    requests.push({
      fieldName: 'stock_status',
      filters: buildFacetSearchFilters(filters, { is_out_of_stock: undefined }),
    });
  }

  return requests;
}

function compareFacetCountValues(left: { count: number; label?: string; value: string }, right: { count: number; label?: string; value: string }): number {
  return right.count - left.count || (left.label ?? left.value).localeCompare(right.label ?? right.value);
}

function buildFacetFromCountMap(
  fieldName: string,
  countMap: Map<string, number>,
  lookup: Map<string, SearchFacetMeta>,
  selectedIds: string[] = [],
  options: FacetFieldBuildOptions = {}
): FacetCount | undefined {
  const effectiveLookup = mergeFacetLookups(lookup, options.fallbackLookup);
  const valueSet = new Set<string>(selectedIds);

  countMap.forEach((_count, value) => {
    valueSet.add(value);
  });

  const counts = Array.from(valueSet)
    .map((value) => {
      const entry = effectiveLookup.get(value);

      return {
        value,
        count: countMap.get(value) ?? 0,
        label: entry?.label ?? value,
        group_key: entry?.groupKey,
        group_label: entry?.groupLabel,
      };
    })
    .filter((item) => {
      if (!options.hideUnresolvedNumericValues) {
        return true;
      }

      const isUnresolvedNumericValue = item.label === item.value && /^\d+$/.test(item.value);
      return selectedIds.includes(item.value) || !isUnresolvedNumericValue;
    })
    .sort(compareFacetCountValues);

  return counts.length > 0 ? { field_name: fieldName, counts } : undefined;
}

function dedupeNormalizedItems(items: NormalizedOrdonDbItem[]): NormalizedOrdonDbItem[] {
  const uniqueItems = new Map<string, NormalizedOrdonDbItem>();

  items.forEach((item) => {
    if (!uniqueItems.has(item.hit.id)) {
      uniqueItems.set(item.hit.id, item);
    }
  });

  return Array.from(uniqueItems.values());
}

function buildLocalFacetsFromItems(
  items: NormalizedOrdonDbItem[],
  filters: SearchFilters,
  catalogs: FacetCatalogs
): FacetCount[] {
  const categoryEntries = items.flatMap((item) => item.categories);
  const brandEntries = items.flatMap((item) => (item.brand ? [item.brand] : []));
  const vendorEntries = items.flatMap((item) => (item.vendor ? [item.vendor] : []));
  const attributeEntries = items.flatMap((item) => item.attributeValues);
  const specificationEntries = items.flatMap((item) => item.specificationValues);

  const facets = [
    buildFacetFromCountMap(
      'categories_ids',
      buildCountMap(categoryEntries.map((entry) => entry.id)),
      buildFacetLookup(categoryEntries),
      splitFilterValues(filters.category_ids),
      {
        fallbackLookup: catalogs.categories,
      }
    ),
    buildFacetFromCountMap(
      'brand_ids',
      buildCountMap(brandEntries.map((entry) => entry.id)),
      buildFacetLookup(brandEntries),
      splitFilterValues(filters.brand_ids),
      {
        fallbackLookup: catalogs.brands,
      }
    ),
    buildFacetFromCountMap(
      'vendor_ids',
      buildCountMap(vendorEntries.map((entry) => entry.id)),
      buildFacetLookup(vendorEntries),
      splitFilterValues(filters.vendor_ids),
      {
        fallbackLookup: catalogs.vendors,
      }
    ),
    buildFacetFromCountMap(
      'attributes_values_ids',
      buildCountMap(attributeEntries.map((entry) => entry.id)),
      buildFacetLookup(attributeEntries),
      splitFilterValues(filters.attributes_values_ids),
      {
        fallbackLookup: catalogs.attributeValues,
      }
    ),
    buildFacetFromCountMap(
      'specifications_values_ids',
      buildCountMap(specificationEntries.map((entry) => entry.id)),
      buildFacetLookup(specificationEntries),
      splitFilterValues(filters.specifications_values_ids),
      {
        hideUnresolvedNumericValues: true,
      }
    ),
  ].filter((facet): facet is FacetCount => Boolean(facet));

  const inStockCount = items.filter((item) => !item.isOutOfStock).length;
  const outOfStockCount = items.filter((item) => item.isOutOfStock).length;

  if (items.length > 0 || filters.is_out_of_stock != null) {
    facets.push({
      field_name: 'stock_status',
      counts: [
        { value: 'in', count: inStockCount },
        { value: 'out', count: outOfStockCount },
      ],
    });
  }

  return facets;
}

function createLocalSearchResponseFromItems(
  items: NormalizedOrdonDbItem[],
  requestFilters: SearchFilters,
  selectionFilters: SearchFilters,
  catalogs: FacetCatalogs
): SearchResponse {
  const page = requestFilters.page && requestFilters.page > 0 ? requestFilters.page : 1;
  const perPage = requestFilters.per_page && requestFilters.per_page > 0 ? requestFilters.per_page : DEFAULT_PER_PAGE;
  const startIndex = (page - 1) * perPage;
  const total = items.length;

  return {
    hits: items.slice(startIndex, startIndex + perPage).map((item) => item.hit),
    total,
    page,
    per_page: perPage,
    total_pages: total > 0 ? Math.ceil(total / perPage) : 0,
    facets: buildLocalFacetsFromItems(items, selectionFilters, catalogs),
  };
}

function toNumberArray(value?: string): number[] {
  return splitFilterValues(value)
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry));
}

function resolveTotalPages(payload: OrdonDbSearchResponse, filters: SearchFilters): number {
  if (payload.pagination?.total_pages != null) {
    return payload.pagination.total_pages;
  }

  const total = payload.pagination?.total ?? payload.results?.length ?? 0;
  const perPage = payload.pagination?.page_size ?? (filters.per_page && filters.per_page > 0 ? filters.per_page : DEFAULT_PER_PAGE);

  return total > 0 ? Math.ceil(total / perPage) : 1;
}

type UpstreamSearchPayload = {
  rawData: OrdonDbSearchResponse;
  status: number;
  durationMs: number;
};

async function fetchAllOrdonDbSearchPayloads(
  filters: SearchFilters,
  signal?: AbortSignal,
  initialUpstream?: UpstreamSearchPayload
): Promise<UpstreamSearchPayload[]> {
  const firstUpstream = initialUpstream ?? await fetchOrdonDbSearchPayloadWithSignal(buildOrdonDbSearchRequest({
    ...filters,
    page: filters.page && filters.page > 0 ? filters.page : 1,
  }), signal);
  const totalPages = resolveTotalPages(firstUpstream.rawData, filters);
  const currentPage = firstUpstream.rawData.pagination?.page ?? (filters.page && filters.page > 0 ? filters.page : 1);

  if (totalPages <= 1) {
    return [firstUpstream];
  }

  const payloadByPage = new Map<number, UpstreamSearchPayload>([[currentPage, firstUpstream]]);
  const remainingPayloads = await Promise.all(
    Array.from({ length: totalPages }, (_, index) => index + 1)
      .filter((page) => page !== currentPage)
      .map(async (page) => {
        const pageUpstream = await fetchOrdonDbSearchPayloadWithSignal(
          buildOrdonDbSearchRequest({
            ...filters,
            page,
          }),
          signal,
        );

        return { page, upstream: pageUpstream };
      })
  );

  remainingPayloads.forEach(({ page, upstream }) => {
    payloadByPage.set(page, upstream);
  });

  return Array.from({ length: totalPages }, (_, index) => payloadByPage.get(index + 1)).filter(
    (payload): payload is UpstreamSearchPayload => Boolean(payload)
  );
}

async function buildSearchResponseForFilters(
  requestFilters: SearchFilters,
  selectionFilters: SearchFilters,
  locale: SearchLocale,
  catalogs: FacetCatalogs,
  signal?: AbortSignal,
  initialUpstream?: UpstreamSearchPayload,
): Promise<{
  data: SearchResponse;
  rawData: unknown;
  status: number;
  durationMs: number;
}> {
  const upstream = initialUpstream ?? await fetchOrdonDbSearchPayloadWithSignal(buildOrdonDbSearchRequest(requestFilters), signal);
  const primaryData = createOrdonDbSearchResponse(upstream.rawData, selectionFilters, locale, catalogs);

  if (!shouldApplyGroupedAndFiltering(requestFilters, primaryData.facets, catalogs)) {
    return {
      data: primaryData,
      rawData: upstream.rawData,
      status: upstream.status,
      durationMs: upstream.durationMs,
    };
  }

  const allPayloads = await fetchAllOrdonDbSearchPayloads(requestFilters, signal, upstream);
  const allItems = dedupeNormalizedItems(
    allPayloads.flatMap((payload) => normalizeOrdonDbItems(payload.rawData, locale))
  );
  const filteredItems = filterItemsByGroupedSelections(allItems, requestFilters, primaryData.facets, catalogs);

  return {
    data: createLocalSearchResponseFromItems(filteredItems, requestFilters, selectionFilters, catalogs),
    rawData: {
      mode: 'grouped-and-local-filtering',
      pages: allPayloads.map((payload) => payload.rawData),
    },
    status: upstream.status,
    durationMs: allPayloads.reduce((totalDuration, payload) => totalDuration + payload.durationMs, 0),
  };
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

function dedupeFacetEntries(entries: SearchFacetMeta[]): SearchFacetMeta[] {
  const uniqueEntries = new Map<string, SearchFacetMeta>();

  entries.forEach((entry) => {
    if (!entry.id) return;

    if (!uniqueEntries.has(entry.id)) {
      uniqueEntries.set(entry.id, entry);
    }
  });

  return Array.from(uniqueEntries.values());
}

function buildFacetEntriesFromCategories(product: OrdonDbProduct, locale: SearchLocale): SearchFacetMeta[] {
  const categories = (product.categories ?? []).map((category) => ({
    id: category.id != null ? String(category.id) : '',
    label: getLocalizedText(
      locale,
      category.name_en,
      category.name_ar,
      category.slug?.trim() || String(category.id ?? '').trim()
    ),
  })).filter((category) => category.id && category.label);

  if (categories.length > 0) {
    return dedupeFacetEntries(categories);
  }

  return dedupeFacetEntries(
    (product.categories_ids ?? [])
      .map((categoryId) => String(categoryId ?? '').trim())
      .filter(Boolean)
      .map((categoryId) => ({ id: categoryId, label: categoryId }))
  );
}

function buildFacetEntry(id: unknown, locale: SearchLocale, englishLabel: unknown, arabicLabel: unknown): SearchFacetMeta | undefined {
  const normalizedId = String(id ?? '').trim();
  const normalizedLabel = getLocalizedText(locale, englishLabel, arabicLabel, normalizedId);

  if (!normalizedId) return undefined;

  return {
    id: normalizedId,
    label: normalizedLabel || normalizedId,
  };
}

function buildFacetEntriesFromGroups(
  groups: Record<string, OrdonDbAttributeGroup> | null | undefined,
  locale: SearchLocale
): SearchFacetMeta[] {
  const entries: SearchFacetMeta[] = [];

  Object.entries(groups ?? {}).forEach(([groupKey, group]) => {
    const groupLabel = getLocalizedText(locale, group.name_en, group.name_ar, groupKey);

    Object.entries(group.values ?? {}).forEach(([valueId, value]) => {
      const label = getLocalizedText(locale, value?.name_en, value?.name_ar, valueId);

      entries.push({
        id: valueId,
        label,
        groupKey,
        groupLabel,
      });
    });
  });

  return dedupeFacetEntries(entries);
}

function normalizeOrdonDbItem(result: OrdonDbSearchResult, locale: SearchLocale): NormalizedOrdonDbItem | null {
  const product = result.product;
  if (!product?.id) return null;

  const price = toFiniteNumber(product.price) ?? 0;
  const salePrice = toFiniteNumber(product.sale_price);
  const effectivePrice = salePrice != null && salePrice < price ? salePrice : price;
  const categories = buildFacetEntriesFromCategories(product, locale);
  const brand = buildFacetEntry(
    product.brand?.id,
    locale,
    product.brand?.name_en?.trim(),
    product.brand?.name_ar?.trim()
  );
  const vendor = buildFacetEntry(
    product.vendor?.id,
    locale,
    product.vendor?.name_en?.trim(),
    product.vendor?.name_ar?.trim()
  );
  const attributeValues = buildFacetEntriesFromGroups(product.attributes, locale);
  const specificationValues = buildFacetEntriesFromGroups(product.specifications, locale);
  const rating = toFiniteNumber(product.average_rating) ?? 0;
  const isOutOfStock = Boolean(product.is_out_of_stock);

  return {
    hit: {
      id: String(product.id),
      slug: product.slug?.trim() || String(product.id),
      name_en: product.name_en?.trim() || result.name?.trim() || String(product.id),
      name_ar: product.name_ar?.trim() || result.name_ar?.trim() || product.name_en?.trim() || result.name?.trim() || String(product.id),
      brand: brand?.label || '',
      category: categories[0]?.label || '',
      price,
      sale_price: salePrice,
      is_available: !isOutOfStock,
      images: extractImages(product),
      rating,
      stock: toFiniteNumber(product.quantity) ?? (!isOutOfStock ? 1 : 0),
      createdAt: product.created_at?.trim() || undefined,
      popularity_score: toFiniteNumber(result.score) ?? 0,
    },
    categories,
    brand,
    vendor,
    attributeValues,
    specificationValues,
    isOutOfStock,
    rating,
  };
}

function buildFacetLookup(entries: SearchFacetMeta[]): Map<string, SearchFacetMeta> {
  return entries.reduce((lookup, entry) => {
    if (!lookup.has(entry.id)) {
      lookup.set(entry.id, entry);
    }

    return lookup;
  }, new Map<string, SearchFacetMeta>());
}

function buildCountMap(values: string[]): Map<string, number> {
  return values.reduce((counts, value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
}

function recordToCountMap(record?: Record<string, number> | null): Map<string, number> {
  return new Map(Object.entries(record ?? {}));
}

function resolveFacetCountMap(
  record: Record<string, number> | null | undefined,
  fallbackEntries: SearchFacetMeta[]
): Map<string, number> {
  if (record && Object.keys(record).length > 0) {
    return recordToCountMap(record);
  }

  return buildCountMap(fallbackEntries.map((entry) => entry.id));
}

function buildFacetFromIds(
  fieldName: string,
  optionIds: Array<number | string> | null | undefined,
  lookup: Map<string, SearchFacetMeta>,
  countMap: Map<string, number>,
  selectedIds: string[] = [],
  options: FacetFieldBuildOptions = {}
): FacetCount | undefined {
  const effectiveLookup = mergeFacetLookups(lookup, options.fallbackLookup);
  const valueSet = new Set<string>(selectedIds);

  (optionIds ?? []).forEach((optionId) => {
    const normalizedId = String(optionId ?? '').trim();
    if (normalizedId) valueSet.add(normalizedId);
  });

  countMap.forEach((_count, key) => valueSet.add(key));

  const counts = Array.from(valueSet)
    .map((value) => {
      const entry = effectiveLookup.get(value);

      return {
        value,
        count: countMap.get(value) ?? 0,
        label: entry?.label ?? value,
        group_key: entry?.groupKey,
        group_label: entry?.groupLabel,
      };
    })
    .filter((item) => {
      if (!options.hideUnresolvedNumericValues) {
        return true;
      }

      const isUnresolvedNumericValue = item.label === item.value && /^\d+$/.test(item.value);
      return selectedIds.includes(item.value) || !isUnresolvedNumericValue;
    })
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));

  return counts.length > 0 ? { field_name: fieldName, counts } : undefined;
}

function buildOrdonDbFacets(
  payload: OrdonDbSearchResponse,
  items: NormalizedOrdonDbItem[],
  filters: SearchFilters,
  catalogs: FacetCatalogs
): FacetCount[] {
  const categoryEntries = items.flatMap((item) => item.categories);
  const brandEntries = items.flatMap((item) => (item.brand ? [item.brand] : []));
  const vendorEntries = items.flatMap((item) => (item.vendor ? [item.vendor] : []));
  const attributeEntries = items.flatMap((item) => item.attributeValues);
  const specificationEntries = items.flatMap((item) => item.specificationValues);

  const facets = [
    buildFacetFromIds(
      'categories_ids',
      payload.filter_options?.categories_ids,
      buildFacetLookup(categoryEntries),
      resolveFacetCountMap(payload.product_length?.categories_ids, categoryEntries),
      splitFilterValues(filters.category_ids),
      {
        fallbackLookup: catalogs.categories,
      }
    ),
    buildFacetFromIds(
      'brand_ids',
      payload.filter_options?.brand_ids,
      buildFacetLookup(brandEntries),
      resolveFacetCountMap(payload.product_length?.brand_ids, brandEntries),
      splitFilterValues(filters.brand_ids),
      {
        fallbackLookup: catalogs.brands,
      }
    ),
    buildFacetFromIds(
      'vendor_ids',
      payload.filter_options?.vendor_ids,
      buildFacetLookup(vendorEntries),
      resolveFacetCountMap(payload.product_length?.vendor_ids, vendorEntries),
      splitFilterValues(filters.vendor_ids),
      {
        fallbackLookup: catalogs.vendors,
      }
    ),
    buildFacetFromIds(
      'attributes_values_ids',
      payload.filter_options?.attributes_values_ids,
      buildFacetLookup(attributeEntries),
      resolveFacetCountMap(payload.product_length?.attributes_values_ids, attributeEntries),
      splitFilterValues(filters.attributes_values_ids),
      {
        fallbackLookup: catalogs.attributeValues,
      }
    ),
    buildFacetFromIds(
      'specifications_values_ids',
      payload.filter_options?.specifications_values_ids,
      buildFacetLookup(specificationEntries),
      resolveFacetCountMap(payload.product_length?.specifications_values_ids, specificationEntries),
      splitFilterValues(filters.specifications_values_ids),
      {
        hideUnresolvedNumericValues: true,
      }
    ),
  ].filter((facet): facet is FacetCount => Boolean(facet));

  const inStockCount = items.filter((item) => !item.isOutOfStock).length;
  const outOfStockCount = items.filter((item) => item.isOutOfStock).length;

  if (items.length > 0 || filters.is_out_of_stock != null) {
    facets.push({
      field_name: 'stock_status',
      counts: [
        { value: 'in', count: inStockCount },
        { value: 'out', count: outOfStockCount },
      ],
    });
  }

  return facets;
}

function mergeFacetFields(
  baseFacets: FacetCount[] | undefined,
  overrides: Map<string, FacetCount>
): FacetCount[] {
  const mergedFacets = new Map((baseFacets ?? []).map((facet) => [facet.field_name, facet] as const));

  overrides.forEach((facet, fieldName) => {
    mergedFacets.set(fieldName, facet);
  });

  return Array.from(mergedFacets.values());
}

function mergeFacetGroups(
  baseFacets: FacetCount[] | undefined,
  fieldName: string,
  overrideFacet: FacetCount,
  groupKeys: string[]
): FacetCount[] {
  const groupKeySet = new Set(groupKeys);
  const facetMap = new Map((baseFacets ?? []).map((facet) => [facet.field_name, facet] as const));
  const existingFacet = facetMap.get(fieldName);
  const retainedCounts = existingFacet?.counts.filter((item) => !groupKeySet.has(item.group_key ?? '')) ?? [];
  const overrideCounts = overrideFacet.counts.filter((item) => groupKeySet.has(item.group_key ?? ''));
  const mergedCounts = [...retainedCounts, ...overrideCounts].sort(compareFacetCountValues);

  facetMap.set(fieldName, {
    field_name: fieldName,
    counts: mergedCounts,
  });

  return Array.from(facetMap.values());
}

function normalizeOrdonDbItems(
  payload: OrdonDbSearchResponse,
  locale: SearchLocale
): NormalizedOrdonDbItem[] {
  if (!Array.isArray(payload?.results)) {
    throw new Error('Invalid SearchOrdonDBProduct response');
  }

  return payload.results
    .map((result) => normalizeOrdonDbItem(result, locale))
    .filter((item): item is NormalizedOrdonDbItem => Boolean(item));
}

function createOrdonDbSearchResponse(
  payload: OrdonDbSearchResponse,
  filters: SearchFilters,
  locale: SearchLocale,
  catalogs: FacetCatalogs
): SearchResponse {
  const normalizedItems = normalizeOrdonDbItems(payload, locale);

  const page = payload.pagination?.page ?? (filters.page && filters.page > 0 ? filters.page : 1);
  const perPage = payload.pagination?.page_size ?? (filters.per_page && filters.per_page > 0 ? filters.per_page : DEFAULT_PER_PAGE);
  const total = payload.pagination?.total ?? normalizedItems.length;
  const totalPages = payload.pagination?.total_pages ?? (total > 0 ? Math.ceil(total / perPage) : 0);

  return {
    hits: normalizedItems.map((item) => item.hit),
    total,
    page,
    per_page: perPage,
    total_pages: totalPages,
    facets: buildOrdonDbFacets(payload, normalizedItems, filters, catalogs),
  };
}

async function normalizeOrdonDbSearchResponse(
  payload: OrdonDbSearchResponse,
  filters: SearchFilters,
  locale: SearchLocale
): Promise<SearchResponse> {
  const catalogs = await loadFacetCatalogs(locale);

  return createOrdonDbSearchResponse(payload, filters, locale, catalogs);
}

function normalizeOrdonDbAutocompleteResponse(
  payload: OrdonDbSearchResponse,
  perPage: number,
  locale: SearchLocale
): AutocompleteResponse {
  const suggestions = normalizeOrdonDbItems(payload, locale)
    .slice(0, perPage)
    .map((item) => ({
      id: item.hit.id,
      slug: item.hit.slug,
      name_en: item.hit.name_en,
      name_ar: item.hit.name_ar,
      image: item.hit.images?.[0],
    }));

  return { suggestions };
}

function unwrapLegacyData<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    !('meta' in payload)
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

function normalizeLegacySearchResponse(rawData: unknown): SearchResponse {
  const payload = unwrapLegacyData<Partial<SearchResponse>>(rawData);

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid legacy search response');
  }

  return {
    ...payload,
    total_pages: payload.total_pages ?? Math.ceil((payload.total ?? 0) / (payload.per_page || DEFAULT_PER_PAGE)),
  } as SearchResponse;
}

function normalizeLegacyAutocompleteResponse(rawData: unknown): AutocompleteResponse {
  return unwrapLegacyData<AutocompleteResponse>(rawData);
}

function logProcessedResult(
  name: string,
  result: SearchRequestDebugResult<unknown>,
  extra: Record<string, unknown> = {}
) {
  logSearchDebug(name, {
    source: result.source,
    status: result.status,
    durationMs: `${result.durationMs}ms`,
    ...extra,
    rawData: result.rawData,
    finalData: result.data,
  });
}

async function fetchOrdonDbSearchPayload(query?: string): Promise<{
  rawData: OrdonDbSearchResponse;
  status: number;
  durationMs: number;
}> {
  return fetchOrdonDbSearchPayloadWithSignal({ query: normalizeQuery(query) });
}

async function fetchOrdonDbSearchPayloadWithSignal(
  requestPayload: OrdonDbSearchRequest,
  signal?: AbortSignal
): Promise<{
  rawData: OrdonDbSearchResponse;
  status: number;
  durationMs: number;
}> {
  const response = await debugFetch<OrdonDbSearchResponse>('SearchOrdonDBProduct', ORDON_DB_SEARCH_URL, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`SearchOrdonDBProduct failed: ${response.status}`);
  }

  return {
    rawData: response.data,
    status: response.status,
    durationMs: response.durationMs,
  };
}

function buildOrdonDbSort(sortBy?: SortOption): OrdonDbSearchRequest['sort'] | undefined {
  switch (sortBy) {
    case 'created_at:desc':
      return { key: 'created_at', order: 'desc' };
    case 'price:asc':
      return { key: 'price', order: 'asc' };
    case 'price:desc':
      return { key: 'price', order: 'desc' };
    case 'rating:desc':
      return { key: 'average_rating', order: 'desc' };
    default:
      return undefined;
  }
}

function buildOrdonDbSearchRequest(filters: SearchFilters): OrdonDbSearchRequest {
  const requestFilters: NonNullable<OrdonDbSearchRequest['filters']> = {};

  const categoryIds = toNumberArray(filters.category_ids);
  const brandIds = toNumberArray(filters.brand_ids);
  const vendorIds = toNumberArray(filters.vendor_ids);
  const attributeValueIds = toNumberArray(filters.attributes_values_ids);
  const specificationValueIds = toNumberArray(filters.specifications_values_ids);

  if (categoryIds.length > 0) requestFilters.categories_ids = categoryIds;
  if (brandIds.length > 0) requestFilters.brand_ids = brandIds;
  if (vendorIds.length > 0) requestFilters.vendor_ids = vendorIds;
  if (attributeValueIds.length > 0) requestFilters.attributes_values_ids = attributeValueIds;
  if (specificationValueIds.length > 0) requestFilters.specifications_values_ids = specificationValueIds;

  if (filters.min_price != null || filters.max_price != null) {
    requestFilters.price = {
      min: filters.min_price ?? null,
      max: filters.max_price ?? null,
      eq: null,
    };
  }

  requestFilters.is_out_of_stock = filters.is_out_of_stock ?? false;

  if (filters.average_rating_min != null) {
    requestFilters.average_rating = {
      min: filters.average_rating_min,
      max: null,
      eq: null,
    };
  }

  const sort = buildOrdonDbSort(filters.sort_by);

  return {
    query: normalizeQuery(filters.q),
    ...(Object.keys(requestFilters).length > 0 ? { filters: requestFilters } : {}),
    ...(sort ? { sort } : {}),
    pagination: {
      page: filters.page && filters.page > 0 ? filters.page : 1,
      per_page: filters.per_page && filters.per_page > 0 ? filters.per_page : DEFAULT_PER_PAGE,
    },
  };
}

async function requestOrdonDbSearch(
  filters: SearchFilters,
  signal?: AbortSignal,
  locale?: string
): Promise<SearchRequestDebugResult<SearchResponse>> {
  const normalizedLocale = normalizeSearchLocale(locale);
  const startedAt = Date.now();
  const catalogsPromise = loadFacetCatalogs(normalizedLocale);
  const requestPayload = buildOrdonDbSearchRequest(filters);
  const upstream = await fetchOrdonDbSearchPayloadWithSignal(requestPayload, signal);
  const catalogs = await catalogsPromise;
  const primaryResult = await buildSearchResponseForFilters(
    filters,
    filters,
    normalizedLocale,
    catalogs,
    signal,
    upstream,
  );
  const disjunctiveFacetRequests = buildDisjunctiveFacetRequests(filters, primaryResult.data.facets);
  let finalData = primaryResult.data;
  let rawData: unknown = primaryResult.rawData;

  if (disjunctiveFacetRequests.length > 0) {
    const disjunctiveFacetResponses = await Promise.all(
      disjunctiveFacetRequests.map(async (facetRequest) => {
        try {
          const facetPayload = buildOrdonDbSearchRequest(facetRequest.filters);
          const facetResult = await buildSearchResponseForFilters(
            facetRequest.filters,
            filters,
            normalizedLocale,
            catalogs,
            signal,
          );

          return {
            fieldName: facetRequest.fieldName,
            groupKeys: facetRequest.groupKeys,
            payload: facetPayload,
            rawData: facetResult.rawData,
            data: facetResult.data,
            status: facetResult.status,
            durationMs: facetResult.durationMs,
          };
        } catch {
          return null;
        }
      })
    );

    let mergedFacets = primaryResult.data.facets;

    disjunctiveFacetResponses.forEach((response) => {
      if (!response) return;

      const facet = response.data.facets?.find((item) => item.field_name === response.fieldName);
      if (!facet) {
        return;
      }

      if (response.groupKeys && response.groupKeys.length > 0) {
        mergedFacets = mergeFacetGroups(mergedFacets, response.fieldName, facet, response.groupKeys);
        return;
      }

      mergedFacets = mergeFacetFields(mergedFacets, new Map([[response.fieldName, facet]]));
    });

    finalData = {
      ...primaryResult.data,
      facets: mergedFacets,
    };

    rawData = {
      primary: primaryResult.rawData,
      disjunctiveFacets: disjunctiveFacetResponses
        .filter((response): response is NonNullable<typeof response> => Boolean(response))
        .map((response) => ({
          fieldName: response.fieldName,
          groupKeys: response.groupKeys,
          payload: response.payload,
          rawData: response.rawData,
          status: response.status,
          durationMs: response.durationMs,
        })),
    };
  }

  const result: SearchRequestDebugResult<SearchResponse> = {
    data: finalData,
    rawData,
    source: 'ordondb',
    status: upstream.status,
    durationMs: Date.now() - startedAt,
  };

  logProcessedResult('ORDONDB SEARCH FINAL', result, {
    query: requestPayload.query,
    payload: requestPayload,
    disjunctiveFacetFields: disjunctiveFacetRequests.map((request) => request.groupKeys?.length
      ? `${request.fieldName}:${request.groupKeys.join('|')}`
      : request.fieldName),
  });

  return result;
}

function shouldUseOrdonDbSearch(filters: SearchFilters): boolean {
  return typeof filters.q === 'string'
    || Boolean(
      filters.category_ids
      || filters.brand_ids
      || filters.vendor_ids
      || filters.attributes_values_ids
      || filters.specifications_values_ids
      || filters.min_price != null
      || filters.max_price != null
      || filters.is_out_of_stock != null
      || filters.average_rating_min != null
    );
}

async function legacyServerSearch(
  filters: SearchFilters,
  signal?: AbortSignal,
  locale?: string
): Promise<SearchRequestDebugResult<SearchResponse>> {
  const qs = buildSearchParams(filters, locale, { includeLocale: true });
  const response = await debugFetch('LegacySearch', `${API_BASE}/search?${qs}`, {
    cache: 'no-store',
    signal,
  });

  if (!response.ok) throw new Error(`Search failed: ${response.status}`);

  const result: SearchRequestDebugResult<SearchResponse> = {
    data: normalizeLegacySearchResponse(response.data),
    rawData: response.data,
    source: 'legacy',
    status: response.status,
    durationMs: response.durationMs,
  };

  logProcessedResult('LEGACY SEARCH FINAL', result, {
    query: normalizeQuery(filters.q),
    queryString: qs,
  });

  return result;
}

async function legacyServerAutocomplete(
  q: string,
  perPage = 8,
  signal?: AbortSignal
): Promise<SearchRequestDebugResult<AutocompleteResponse>> {
  const params = new URLSearchParams({ q, per_page: String(perPage) });
  const response = await debugFetch('LegacyAutocomplete', `${API_BASE}/search/autocomplete?${params}`, {
    cache: 'no-store',
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Autocomplete failed: ${response.status}`);
  }

  const result: SearchRequestDebugResult<AutocompleteResponse> = {
    data: normalizeLegacyAutocompleteResponse(response.data),
    rawData: response.data,
    source: 'legacy',
    status: response.status,
    durationMs: response.durationMs,
  };

  logProcessedResult('LEGACY AUTOCOMPLETE FINAL', result, {
    query: q,
    perPage,
  });

  return result;
}

export async function serverAutocomplete(q: string, perPage = 8): Promise<AutocompleteResponse> {
  return (await serverAutocompleteWithSource(q, perPage)).data;
}

export async function serverAutocompleteWithSource(
  q: string,
  perPage = 8,
  signal?: AbortSignal,
  locale?: string
): Promise<SearchRequestDebugResult<AutocompleteResponse>> {
  const normalizedLocale = normalizeSearchLocale(locale);
  const normalizedQ = q.trim();
  if (!normalizedQ) {
    return {
      data: { suggestions: [] },
      rawData: { suggestions: [] },
      source: 'ordondb',
      status: 200,
      durationMs: 0,
    };
  }

  try {
    const upstream = await fetchOrdonDbSearchPayloadWithSignal({
      query: normalizeQuery(normalizedQ),
      pagination: {
        page: 1,
        per_page: perPage,
      },
    }, signal);
    const result: SearchRequestDebugResult<AutocompleteResponse> = {
      data: normalizeOrdonDbAutocompleteResponse(upstream.rawData, perPage, normalizedLocale),
      rawData: upstream.rawData,
      source: 'ordondb',
      status: upstream.status,
      durationMs: upstream.durationMs,
    };

    logProcessedResult('ORDONDB AUTOCOMPLETE FINAL', result, {
      query: normalizedQ,
      perPage,
    });

    return result;
  } catch {
    return legacyServerAutocomplete(normalizedQ, perPage, signal);
  }
}

// ─── Server-side fetch (for Server Components — no auth needed) ─────────────

export async function serverSearch(filters: SearchFilters, locale?: string): Promise<SearchResponse> {
  return (await serverSearchWithSource(filters, undefined, locale)).data;
}

export async function serverSearchWithSource(
  filters: SearchFilters,
  signal?: AbortSignal,
  locale?: string
): Promise<SearchRequestDebugResult<SearchResponse>> {
  if (!shouldUseOrdonDbSearch(filters)) {
    return legacyServerSearch(filters, signal, locale);
  }

  try {
    return requestOrdonDbSearch(filters, signal, locale);
  } catch {
    return legacyServerSearch(filters, signal, locale);
  }
}

// ─── Client-side fetch (uses apiClient for consistency) ─────────────────────

export async function clientSearch(filters: SearchFilters, locale?: string): Promise<SearchResponse> {
  const qs = buildSearchParams(filters);
  const response = await debugFetch<SearchResponse>('LocalSearchRoute', `${LOCAL_SEARCH_API_PATH}?${qs}`, {
    cache: 'no-store',
    credentials: 'include',
    headers: locale ? { 'x-search-locale': locale } : undefined,
  });

  if (!response.ok) {
    return (await legacyServerSearch(filters, undefined, locale)).data;
  }

  return response.data;
}

export async function clientAutocomplete(
  q: string,
  perPage = 8,
  signal?: AbortSignal
): Promise<AutocompleteResponse> {
  const normalizedQ = q.trim();
  if (!normalizedQ) return { suggestions: [] };

  const params = new URLSearchParams({ q: normalizedQ, per_page: String(perPage) });
  const response = await debugFetch<AutocompleteResponse>('LocalAutocompleteRoute', `${LOCAL_AUTOCOMPLETE_API_PATH}?${params}`, {
    cache: 'no-store',
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    return (await legacyServerAutocomplete(normalizedQ, perPage)).data;
  }

  return response.data;
}
