"use client";

import { Link } from "@/i18n/navigation";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button, PageWrapper } from "@/components/ui";
import { ProductGrid } from "@/components/products";
import { useWishlist } from "@/hooks/use-wishlist";
import { Product } from "@/types";
import { useLocale } from "next-intl";

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : undefined;
}

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist();
  const locale = useLocale();

  // Convert wishlist items to products format for ProductGrid
  const wishlistProducts = items.map((item) => ({
    ...item.product,
    id: item.product.id.toString(), // ensure string ID for ProductCard
    name: locale === "ar" ? item.product.name_ar || item.product.name_en : item.product.name_en,
    images: [item.product.image || '/placeholder.svg'],
    slug: '#',
    price: (() => {
      const regular = toNumber((item.product as any)?.price) ?? 0;
      const sale = toNumber((item.product as any)?.sale_price) ?? toNumber((item.product as any)?.salePrice);
      return sale !== undefined && sale > 0 && sale < regular ? sale : regular;
    })(),
    compareAtPrice: (() => {
      const regular = toNumber((item.product as any)?.price) ?? 0;
      const sale = toNumber((item.product as any)?.sale_price) ?? toNumber((item.product as any)?.salePrice);
      return sale !== undefined && sale > 0 && sale < regular ? regular : undefined;
    })(),
    description: '',
    stock: 10,
    rating: 0,
    reviewCount: 0,
  } as any as Product)); // Cast to Product

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-third" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-4">Your Wishlist is Empty</h1>
          <p className="text-third mb-8">
            Save items you love by clicking the heart icon on any product. Your wishlist will be waiting for you!
          </p>
          <Link href="/products">
            <Button size="lg">
              <ShoppingBag className="w-5 h-5" />
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper className="container mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">My Wishlist</h1>
          <p className="text-third">{items.length} items saved</p>
        </div>
        <Button
          variant="solid"
          onClick={clearWishlist}
          className="bg-gray-100 hover:bg-gray-200 shadow-gray-200/50 text-secondary hover:text-secondary"
        >
          <Trash2 className="w-4 h-4" />
          Clear Wishlist
        </Button>
      </div>

      {/* Wishlist Products */}
      <ProductGrid products={wishlistProducts} columns={4} />
    </PageWrapper>
  );
}
