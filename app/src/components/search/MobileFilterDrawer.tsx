'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, SlidersHorizontal } from 'lucide-react';
import { SearchFilters } from './SearchFilters';
import type { FacetCount } from '@/lib/search/types';

interface Props {
  facets: FacetCount[];
}

export function MobileFilterDrawer({ facets }: Props) {
  const t = useTranslations('search');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating filter button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 end-4 bg-primary text-white px-6 py-3 rounded-full shadow-lg z-40 flex items-center gap-2"
      >
        <SlidersHorizontal className="w-4 h-4" />
        {t('filters')}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 start-0 end-0 bg-white rounded-t-2xl p-6 z-50 transition-transform duration-300 max-h-[80vh] overflow-y-auto ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('filters')}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SearchFilters facets={facets} />
      </div>
    </>
  );
}
