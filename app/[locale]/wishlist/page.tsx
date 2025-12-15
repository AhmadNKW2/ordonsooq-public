"use client";

import { Link } from "@/i18n/navigation";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { ProductGrid } from "@/components/products";
import { useWishlist } from "@/hooks/use-wishlist";

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist();

  // Convert wishlist items to products format for ProductGrid
  const wishlistProducts = items.map((item) => item.product);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
          <p className="text-gray-500 mb-8">
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
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-500">{items.length} items saved</p>
        </div>
        <Button
          variant="solid"
          onClick={clearWishlist}
          className="bg-gray-100 hover:bg-gray-200 shadow-gray-200/50 text-danger hover:text-danger"
        >
          <Trash2 className="w-4 h-4" />
          Clear Wishlist
        </Button>
      </div>

      {/* Wishlist Products */}
      <ProductGrid products={wishlistProducts} columns={4} />
    </div>
  );
}
