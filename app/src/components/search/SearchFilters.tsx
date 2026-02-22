'use client';

import { useTranslations } from 'next-intl';
import { useSearchFilters } from '@/lib/search/use-search-params';
import type { FacetCount } from '@/lib/search/types';

interface Props {
  facets: FacetCount[];
}

export function SearchFilters({ facets }: Props) {
  const t = useTranslations('search');
  const { filters, changeFilter, setMinPrice, setMaxPrice, resetFilters } = useSearchFilters();

  const facetMap = Object.fromEntries(facets.map((f) => [f.field_name, f]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{t('filters')}</h3>
        <button
          onClick={resetFilters}
          className="text-xs text-blue-600 hover:underline"
        >
          {t('clearFilters')}
        </button>
      </div>

      {/* Brand facet */}
      {facetMap.brand && (
        <FacetGroup
          title={t('brandFilter')}
          facet={facetMap.brand}
          selected={filters.brand}
          onSelect={(v) => changeFilter('brand', v)}
        />
      )}

      {/* Category facet */}
      {facetMap.category && (
        <FacetGroup
          title={t('categoryFilter')}
          facet={facetMap.category}
          selected={filters.category}
          onSelect={(v) => changeFilter('category', v)}
        />
      )}

      {/* Price range */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('priceFilter')}</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={t('minPrice')}
            value={filters.min_price ?? ''}
            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            placeholder={t('maxPrice')}
            value={filters.max_price ?? ''}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

function FacetGroup({
  title,
  facet,
  selected,
  onSelect,
}: {
  title: string;
  facet: FacetCount;
  selected?: string;
  onSelect: (value: string | null) => void;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      <ul className="space-y-1 max-h-48 overflow-y-auto">
        {facet.counts.slice(0, 15).map((c) => (
          <li key={c.value}>
            <button
              onClick={() => onSelect(selected === c.value ? null : c.value)}
              className={`flex justify-between w-full text-start text-sm px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                selected === c.value
                  ? 'font-semibold text-blue-700 bg-blue-50'
                  : 'text-gray-600'
              }`}
            >
              <span className="truncate">{c.value}</span>
              <span className="text-gray-400 text-xs ms-2">{c.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
