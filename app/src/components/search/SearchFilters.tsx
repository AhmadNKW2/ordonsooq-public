'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { joinFilterValues, splitFilterValues } from '@/lib/search/filter-utils';
import { useSearchFilters } from '@/lib/search/use-search-params';
import { Card, Checkbox } from '@/components/ui';
import { useLoading } from '@/components/ui/global-loader';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FacetCount } from '@/lib/search/types';

interface Props {
  facets: FacetCount[];
}

export function SearchFilters({ facets }: Props) {
  const t = useTranslations('search');
  const tCommon = useTranslations('common');
  const { setIsLoading } = useLoading();
  const { filters, changeFilter, setMinPrice, setMaxPrice, resetFilters } = useSearchFilters();

  const [expandedSections, setExpandedSections] = useState<string[]>([
    "brand",
    "category",
    "price",
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const brandFacet = facets.find((facet) => ["brand", "brand_id", "brand_ids"].includes(facet.field_name));
  const categoryFacet = facets.find((facet) => ["category", "category_id", "category_ids", "categories_ids"].includes(facet.field_name));

  const activeFiltersCount =
    (filters.brand_ids ? 1 : 0) +
    (filters.category_ids ? 1 : 0) +
    (filters.min_price || filters.max_price ? 1 : 0);

  return (
    <Card className="p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-primary">{tCommon('filters')}</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={() => {
              setIsLoading(true);
              resetFilters();
            }}
            className="text-sm text-primary hover:underline"
          >
            {tCommon('clearAll', { count: activeFiltersCount })}
          </button>
        )}
      </div>

      {/* Brand facet */}
      {brandFacet && (
        <FilterSection
          title={t('brandFilter')}
          isExpanded={expandedSections.includes("brand")}
          onToggle={() => toggleSection("brand")}
        >
          <FacetGroup
            facet={brandFacet}
            selected={splitFilterValues(filters.brand_ids)}
            onSelect={(values) => {
              setIsLoading(true);
              changeFilter('brand_ids', joinFilterValues(values));
            }}
          />
        </FilterSection>
      )}

      {/* Category facet */}
      {categoryFacet && (
        <FilterSection
          title={t('categoryFilter')}
          isExpanded={expandedSections.includes("category")}
          onToggle={() => toggleSection("category")}
        >
          <FacetGroup
            facet={categoryFacet}
            selected={splitFilterValues(filters.category_ids)}
            onSelect={(values) => {
              setIsLoading(true);
              changeFilter('category_ids', joinFilterValues(values));
            }}
          />
        </FilterSection>
      )}

      {/* Price range */}
      <FilterSection
        title={t('priceFilter')}
        isExpanded={expandedSections.includes("price")}
        onToggle={() => toggleSection("price")}
      >
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
      </FilterSection>
    </Card>
  );
}

function FacetGroup({
  facet,
  selected,
  onSelect,
}: {
  facet: FacetCount;
  selected: string[];
  onSelect: (value: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {facet.counts.slice(0, 15).map((c) => (
        <div
          key={c.value}
          className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
        >
          <Checkbox
            checked={selected.includes(c.value)}
            onChange={() => onSelect(
              selected.includes(c.value)
                ? selected.filter((value) => value !== c.value)
                : [...selected, c.value]
            )}
          />
          <span
            className="text-sm text-primary cursor-pointer flex-1 truncate"
            onClick={() => onSelect(
              selected.includes(c.value)
                ? selected.filter((value) => value !== c.value)
                : [...selected, c.value]
            )}
          >
            {c.label ?? c.value}
          </span>
          <span className="text-xs text-third">
            ({c.count})
          </span>
        </div>
      ))}
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-medium text-primary">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-third" />
        ) : (
          <ChevronDown className="w-4 h-4 text-third" />
        )}
      </button>
      <div
        className={cn(
          "transition-all duration-300",
          isExpanded ? "max-h-96 mt-3 overflow-visible" : "max-h-0 overflow-hidden"
        )}
      >
        <div className="px-1 py-1">
          {children}
        </div>
      </div>
    </div>
  );
}
