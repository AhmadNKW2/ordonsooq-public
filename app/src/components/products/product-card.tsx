"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
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
  const { addItem, items, openCart } = useCart();
  const { toggleItem, isInWishlist, isItemLoading } = useWishlist();
  const [cartButtonStatus, setCartButtonStatus] = useState<"idle" | "loading" | "success">("idle");

  const hasVariants =
    !!product.hasVariants ||
    (product.variants?.length ?? 0) > 0 ||
    (((product as any).variantIds?.length ?? 0) > 0) ||
    (((product as any).variants_ids?.length ?? 0) > 0);

  const discount = product.compareAtPrice
    ? calculateDiscount(product.compareAtPrice, product.price)
    : 0;

  const wishlistVariantId = product.defaultVariantId != null && String(product.defaultVariantId).length > 0
    ? Number(product.defaultVariantId)
    : null;

  const inWishlist = isInWishlist(product.id, wishlistVariantId);

  const variantAttributesSummary = useMemo(() => {
    if (!product.defaultVariantId || !product.variants || product.variants.length === 0) return "";

    const variant = product.variants.find((v) => String(v.id) === String(product.defaultVariantId));
    if (!variant) return "";

    const ordered = product.attributes?.map((a) => ({ id: a.id, name: a.name }))
      ?? Object.keys(variant.attributes).map((id) => ({ id, name: id }));

    const parts = ordered
      .map(({ id, name }) => {
        const value = variant.attributes[id];
        return value ? `${name}: ${value}` : null;
      })
      .filter(Boolean) as string[];

    return parts.join(", ");
  }, [product.defaultVariantId, product.variants, product.attributes]);

  // Use next-intl navigation objects to keep locale stable.
  // Also include variant id so the product details page can auto-select options.
  const productHref = product.defaultVariantId
    ? `/products/${product.slug}?variant=${product.defaultVariantId}`
    : `/products/${product.slug}`;

  // Check if item is in cart
  const cartItem = items.find(
    (item) => String(item.product_id) === String(product.id) && item.variant_id == null
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleCardClick = () => {
    router.push(productHref);
  };

  const handleAddToCart = (quantity: number) => {
    addItem(product, quantity);
  };

  const handleAnimationEnd = () => {
    openCart();
  };

  const handleCartButtonStatusChange = (status: "idle" | "loading" | "success") => {
    setCartButtonStatus(status);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleItem(product, wishlistVariantId);
  };

  if (variant === "horizontal") {
    return (
      <div
        onClick={handleCardClick}
        className="group flex gap-5 p-4 bg-white rounded-r1 border border-gray-100 shadow-s1 hover:shadow-s1 transition-all duration-300 cursor-pointer"
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
            {variantAttributesSummary ? (
              <span className="">{" "}({variantAttributesSummary})</span>
            ) : null}
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
            {variantAttributesSummary ? (
              <span className="font-normal text-third">{" "}({variantAttributesSummary})</span>
            ) : null}
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
              variant="wishlist"
              isActive={inWishlist}
              isLoading={isItemLoading(product.id, wishlistVariantId)}
              aria-label={inWishlist ? t('product.removeFromWishlist') : t('product.addToWishlist')}
              icon="heart"
              shape="circle"
            />
          </div>
        )}

        {/* Cart Badge (Unhovered) */}
        {showActions && quantity > 0 && (
          <div className="absolute bottom-3 right-3 z-10 transition-opacity duration-300 opacity-100 group-hover:opacity-0 pointer-events-none">
            <div className="flex items-center gap-1 bg-secondary/90 backdrop-blur-sm text-white px-2 py-1 rounded-full shadow-lg text-xs font-bold">
              <ShoppingCart size={14} />
              <span>{quantity}</span>
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        {showActions && (
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/40 to-transparent transition-all duration-500 ease-out z-20",
              cartButtonStatus === "idle"
                ? "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                : "opacity-100 translate-y-0"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {hasVariants ? (
              <button
                type="button"
                className="w-full h-11 rounded-full bg-white/80 text-primary hover:bg-white hover:scale-103 transition-all text-sm font-bold shadow-s1 flex items-center justify-center gap-2"
                onClick={() => router.push(productHref)}
                aria-label={t('product.chooseOptions')}
              >
                <ShoppingCart size={18} />
                <span>{t('product.chooseOptions')}</span>
              </button>
            ) : (
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  stock: product.stock,
                  image: product.images?.[0] || (product as any).image,
                } as any}
                onStatusChange={handleCartButtonStatusChange}
                onAnimationEnd={handleAnimationEnd}
              />
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 flex flex-col grow gap-2">
        {/* Name */}
        <h3 className="font-medium text-sm text-primary group-hover:text-primary transition-colors line-clamp-2 text-center">
          {product.name}
          {variantAttributesSummary ? (
            <span className="font-normal text-third">{" "}({variantAttributesSummary})</span>
          ) : null}
        </h3>

        {/* Brand/Vendor - if available */}
        {(product.vendor?.name || product.brand?.name) && (
          <p className="text-xs text-third text-center line-clamp-1">
            {product.vendor?.name || product.brand?.name}
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
          <span className="text-lg font-bold text-secondary">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-third line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock === 0 && (
          <p className="text-xs text-third mt-2 text-center">
            {t('product.outOfStock')}
          </p>
        )}
      </div>
    </div>
  );
}
