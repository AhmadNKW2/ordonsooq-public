'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import type { SearchHit } from '@/lib/search/types';

interface Props {
  hit: SearchHit;
}

export function SearchProductCard({ hit }: Props) {
  const locale = useLocale();
  const t = useTranslations('search');

  const name = locale === 'ar' ? hit.name_ar : hit.name_en;
  const image = hit.images?.[0];
  const hasDiscount = hit.sale_price != null && hit.sale_price < hit.price;
  const displayPrice = hasDiscount ? hit.sale_price! : hit.price;

  return (
    <Link href={`/products/${hit.id}`} className="group block">
      <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
        {/* Image */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              {t('noImage')}
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <span className="absolute top-2 start-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{Math.round(((hit.price - hit.sale_price!) / hit.price) * 100)}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-1">{hit.brand}</p>
          <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 mb-2">
            {name}
          </p>

          {/* Rating */}
          {hit.rating != null && hit.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-xs text-gray-600">
                {hit.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(displayPrice, undefined, locale)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(hit.price, undefined, locale)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
