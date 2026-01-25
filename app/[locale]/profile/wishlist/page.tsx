"use client";

import { useWishlist } from "@/hooks/use-wishlist";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/products/product-card";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/types";
import { transformProduct } from "@/lib/transformers";

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : undefined;
}

export default function WishlistPage() {
  const { items, isLoading, removeItem } = useWishlist();
  const locale = useLocale();
  const t = useTranslations('wishlist');
  const tCommon = useTranslations('common');

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">{tCommon('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const mappedProduct = transformProduct(item.product as any, locale as any);

            return (
              <div key={item.id} className="relative group">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.product_id, item.variant_id);
                  }}
                  aria-label="Remove from wishlist"
                  className="absolute top-3 right-3 z-30 h-8 w-8 rounded-full bg-white/90 shadow-s1 text-gray-600 hover:text-danger hover:bg-white transition flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <X size={16} />
                </button>

                <ProductCard product={mappedProduct} showActions={false} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-12 bg-white rounded-xl border border-gray-100 border-dashed">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Heart size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{t('empty.title')}</h3>
            <p className="text-gray-500 mb-6">{t('empty.description')}</p>
            <Link href="/" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
              <ShoppingBag size={16} /> {tCommon('continueShopping')}
            </Link>
        </div>
      )}
    </div>
  );
}
