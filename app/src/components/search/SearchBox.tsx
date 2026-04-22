'use client';

import { useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAutocomplete } from '@/lib/search/use-autocomplete';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui';
import { productService } from '@/services/product.service';

export function SearchBox() {
  const autocompleteMinChars = 3;
  const locale = useLocale();
  const t = useTranslations('common');
  const router = useRouter();
  const { query, setQuery, suggestions, isLoading, isOpen, close } = useAutocomplete(autocompleteMinChars, 450);
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

  async function handleSuggestionClick(suggestion: { id: string; slug?: string | null }) {
    close();

    const resolvedSlug = suggestion.slug?.trim();
    if (resolvedSlug) {
      router.push(`/products/${resolvedSlug}`);
      return;
    }

    const productId = Number(suggestion.id);
    if (!Number.isFinite(productId)) {
      return;
    }

    const product = await productService.getById(productId).catch(() => null);
    const slug = product?.slug?.trim();

    if (slug) {
      router.push(`/products/${slug}`);
    }
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
              {s.image && (
                <div className="relative w-10 h-10 shrink-0">
                  <Image
                    src={s.image}
                    alt={getName(s)}
                    fill
                    className="object-cover rounded"
                    sizes="40px"
                  />
                </div>
              )}
              <p className="flex-1 min-w-0 text-sm font-medium text-gray-900 truncate">
                {getName(s)}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && query.trim().length >= autocompleteMinChars && (
        <div className="absolute top-full start-0 end-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-4 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}
