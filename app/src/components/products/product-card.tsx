"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { Product } from "@/types";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { Badge, IconButton } from "@/components/ui";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { AddToCartButton } from "./add-to-cart-button";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "horizontal";
  showActions?: boolean;
}

export function ProductCard({
  product,
  variant = "default",
  showActions = true
}: ProductCardProps) {
  const t = useTranslations();
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [cartButtonStatus, setCartButtonStatus] = useState<"idle" | "loading" | "success">("idle");

  const discount = product.compareAtPrice
    ? calculateDiscount(product.compareAtPrice, product.price)
    : 0;

  const inWishlist = isInWishlist(product.id);

  const handleCardClick = () => {
    router.push(`/products/${product.slug}`);
  };

  const handleAddToCart = (quantity: number) => {
    addItem(product, quantity);
  };

  const handleCartButtonStatusChange = (status: "idle" | "loading" | "success") => {
    setCartButtonStatus(status);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleItem(product);
  };

  if (variant === "horizontal") {
    return (
      <div
        onClick={handleCardClick}
        className="group flex gap-4 p-4 bg-white rounded-r1 border border-gray-100 shadow-s1 hover:shadow-s1 transition-all duration-300 cursor-pointer"
      >
        <div className="relative w-32 h-32 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={product.images?.[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-primary group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-third line-clamp-2 mt-1">
            {product.description}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 fill-secondary text-secondary" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-third">({product.reviewCount})</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-third line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        onClick={handleCardClick}
        className="group p-2 bg-white rounded-lg border border-gray-100 hover:shadow-s1 transition-all duration-300 cursor-pointer"
      >
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image
            src={product.images?.[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="mt-2">
          <h3 className="text-sm font-medium text-primary line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm font-bold text-primary mt-1">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-r1 border border-gray-100 shadow-s1 overflow-hidden hover:shadow-s1 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 shrink-0">
        <Image
          src={product.images?.[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <Badge variant="new">{t('product.new')}</Badge>
          )}
          {discount > 0 && (
            <Badge variant="sale">-{discount}%</Badge>
          )}
        </div>

        {/* Wishlist Action */}
        {showActions && (
          <div
            className={cn(
              "absolute top-3 right-3 transition-opacity duration-300",
              inWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <IconButton
              onClick={handleToggleWishlist}
              size="sm"
              variant={inWishlist ? "filled" : "default"}
              color={inWishlist ? "var(--color-danger)" : "var(--color-gray-700)"}
              className={cn(
                !inWishlist && "hover:bg-danger hover:text-third"
              )}
              aria-label={inWishlist ? t('product.removeFromWishlist') : t('product.addToWishlist')}
            >
              <Heart className={cn(inWishlist && "fill-current")} />
            </IconButton>
          </div>
        )}

        {/* Add to Cart Button */}
        {showActions && (
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/40 to-transparent transition-all duration-500 ease-out",
              cartButtonStatus === "idle"
                ? "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                : "opacity-100 translate-y-0"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                stock: product.stock,
                image: product.images[0],
              }}
              onAddToCart={handleAddToCart}
              onStatusChange={handleCartButtonStatusChange}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 flex flex-col grow gap-2">
        {/* Name */}
        <h3 className="font-medium text-sm text-primary group-hover:text-primary transition-colors line-clamp-2 text-center">
          {product.name}
        </h3>

        {/* Brand/Vendor - if available */}
        {(product.brand?.name || product.vendor?.name) && (
          <p className="text-xs text-third text-center line-clamp-1">
            {product.brand?.name || product.vendor?.name}
          </p>
        )}

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center justify-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-secondary text-secondary" />
            <span className="text-xs text-third">{product.rating.toFixed(1)}</span>
            {product.reviewCount > 0 && (
              <span className="text-xs text-third">({product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Price - Always at bottom */}
        <div className="flex items-center justify-center gap-2 mt-auto">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-third line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-secondary mt-2 text-center">
            {t('product.lowStock')} - {product.stock} {t('product.itemsLeft', { count: product.stock })}
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-third mt-2 text-center">
            {t('product.outOfStock')}
          </p>
        )}
      </div>
    </div>
  );
}
