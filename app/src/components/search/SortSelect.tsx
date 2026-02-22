'use client';

import { useTranslations } from 'next-intl';
import type { SortOption } from '@/lib/search/types';

const SORT_OPTIONS: { value: SortOption; labelKey: string }[] = [
  { value: 'popularity_score:desc', labelKey: 'sortPopular' },
  { value: 'created_at:desc',       labelKey: 'sortNewest' },
  { value: 'price:asc',             labelKey: 'sortPriceLow' },
  { value: 'price:desc',            labelKey: 'sortPriceHigh' },
  { value: 'rating:desc',           labelKey: 'sortTopRated' },
];

interface Props {
  value: SortOption;
  onChange: (v: string | null) => void;
}

export function SortSelect({ value, onChange }: Props) {
  const t = useTranslations('search');

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-third hidden sm:inline">
        {t('sortBy')}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.labelKey as any)}
          </option>
        ))}
      </select>
    </div>
  );
}
