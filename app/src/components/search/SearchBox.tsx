'use client';

import { useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAutocomplete } from '@/lib/search/use-autocomplete';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui';

export function SearchBox() {
  const locale = useLocale();
  const t = useTranslations('common');
  const router = useRouter();
  const { query, setQuery, suggestions, isLoading, isOpen, close } = useAutocomplete(2, 250);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [close]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    close();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function handleSuggestionClick(suggestion: { id: string }) {
    close();
    // Navigate to product page — uses product id since Typesense may not return slug
    router.push(`/products/${suggestion.id}`);
  }

  const getName = (s: { name_en: string; name_ar: string }) =>
    locale === 'ar' ? s.name_ar : s.name_en;

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex items-center flex-1">
        <Input
          id="search-box-input"
          type="search"
          variant="search"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full start-0 end-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSuggestionClick(s)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-start transition-colors"
            >
              {/* Thumbnail */}
              {s.images?.[0] && (
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src={s.images[0]}
                    alt={getName(s)}
                    fill
                    className="object-cover rounded"
                    sizes="40px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getName(s)}
                </p>
                <p className="text-xs text-gray-500">
                  {s.brand} · {s.category}
                </p>
              </div>
              <p className="text-sm font-semibold text-primary flex-shrink-0">
                {formatPrice(s.price, undefined, locale)}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && query.length >= 2 && (
        <div className="absolute top-full start-0 end-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-4 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}
