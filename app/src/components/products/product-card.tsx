"use client";

import { useMemo, useState, useRef } from "react";
import Image from "next/image";
import { Star, ShoppingCart, Check, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { Badge, IconButton } from "@/components/ui";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { AddToCartButton } from "./add-to-cart-button";
import { FloatingCartButton } from "./floating-cart-button";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";



// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "horizontal";
  showActions?: boolean;
  cartButtonVariant?: "normal" | "floating";
  cartButtonColor?: "blue" | "white";
  cartButtonIcon?: "shopping-cart" | "add-to-cart";
}

export function ProductCard({
  product,
  variant = "default",
  showActions = true,
  cartButtonVariant = "normal",
  cartButtonColor = "blue",
  cartButtonIcon = "shopping-cart"
}: ProductCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { addItem, items, openCart } = useCart();
  const { toggleItem, isInWishlist, isItemLoading } = useWishlist();
  const [cartButtonStatus, setCartButtonStatus] = useState<"idle" | "loading" | "success">("idle");

  const isRecent = useMemo(() => {
    if (!product.createdAt) return false;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(product.createdAt) >= sevenDaysAgo;
  }, [product.createdAt]);

  // Determine if there are actual choices for the user to make
  const hasMultipleVariants = (() => {
    // If we have full variant objects
    if (product.variants && product.variants.length > 0) {
      return product.variants.length > 1;
    }
    // If we have variant IDs from the API
    const vIds = (product as any).variantIds || (product as any).variants_ids;
    if (vIds && vIds.length > 0) {
      return vIds.length > 1;
    }
    // Fallback to the boolean flag
    return !!product.hasVariants;
  })();

  const singleVariant = (!hasMultipleVariants && product.variants?.length === 1) 
    ? product.variants[0] 
    : undefined;

  const hasVariants = hasMultipleVariants;

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
    (item) => {
      const matchProductId = String(item.product_id) === String(product.id);
      if (singleVariant) {
        return matchProductId && String(item.variant_id) === String(singleVariant.id);
      }
      return matchProductId && item.variant_id == null;
    }
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleCardClick = () => {
    router.push(productHref);
  };

  const handleAddToCart = (quantity: number) => {
    addItem(product, quantity);
  };

  const handleAnimationEnd = () => {
    // Only open cart sidebar on desktop — mobile doesn't use the sidebar
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      openCart();
    }
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
                {formatPrice(product.price, undefined, locale)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-third line-through">
                  {formatPrice(product.compareAtPrice, undefined, locale)}
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
            {formatPrice(product.price, undefined, locale)}
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
          className="object-cover group-hover:scale-102 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isRecent && (
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
              // Mobile: always visible. Desktop: hidden until hover (unless already in wishlist)
              inWishlist ? "opacity-100" : "lg:opacity-0 lg:group-hover:opacity-100"
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

        {/* Cart Badge (Unhovered) — desktop only */}
        {showActions && quantity > 0 && cartButtonVariant === "normal" && (
          <div className="hidden lg:block absolute bottom-3 right-3 z-10 transition-opacity duration-300 opacity-100 group-hover:opacity-0 pointer-events-none">
            <div className="flex items-center gap-1 bg-secondary/90 backdrop-blur-sm text-white px-2 py-1 rounded-full shadow-lg text-xs font-bold">
              <ShoppingCart size={14} />
              <span>{quantity}</span>
            </div>
          </div>
        )}

        {/* Floating cart button (mobile always, desktop if variant='floating') */}
        {showActions && (
          <div
            className={cn(
              "absolute bottom-3 right-3 z-20",
              cartButtonVariant === "floating" ? "block" : "lg:hidden"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {hasVariants ? (
              <button
                type="button"
                aria-label={t('product.chooseOptions')}
                onClick={() => router.push(productHref)}
                className={cn(
                  "h-9 w-9 rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform",
                  cartButtonColor === "white" 
                    ? "bg-white text-secondary hover:bg-gray-50 border border-secondary" 
                    : "bg-secondary text-white"
                )}
              >
                {cartButtonIcon === "add-to-cart" ? (
                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' className="w-5 h-5" fill='currentColor' overflow='hidden'><path d='M409.7 752.4c31.8 0 57.6 25.8 57.5 57.6 0 31.8-25.8 57.6-57.5 57.6-31.8 0-57.6-25.8-57.6-57.6s25.8-57.6 57.6-57.6zm327.5 0c31.8 0 57.6 25.8 57.6 57.6s-25.8 57.6-57.6 57.6-57.6-25.8-57.5-57.6c0-31.8 25.8-57.6 57.5-57.6zm-541-563.2c21.6 0 40.7 4.8 60.2 16.6 20.9 12.6 37 31.5 47.1 55.9l3.6 9.7 1.5 6.2 18.5 113.1 31.4 199.2c2.9 17.9 17.5 31.7 35.1 33.7l4.9.3h347.2c18.3 0 34.2-12.3 39.1-30.1l1.1-5.2 48.6-260.5c4.5-24.3 27.9-40.4 52.3-35.8 22.3 4.2 37.9 24.3 36.5 47.1l-.7 5.1L874.2 604c-9.7 60.2-59.9 105.6-120.8 109.2l-7.7.3H398.5c-63.8 0-118.1-46.2-128.5-109.4l-36.3-230.3-12.4-76.3-1-2.5c-2.1-4.9-4.7-8.4-7.5-10.6l-2.7-1.9c-3.3-2-6.8-3.1-10.1-3.5l-3.8-.2h-85.3c-24.7 0-44.8-20.1-44.8-44.8 0-22.7 16.9-41.7 39.6-44.5l5.2-.3h85.3zm382.2-1.2c22.7 0 41.7 16.9 44.5 39.6l.3 5.2v66.1h66.2c23.1 0 42.1 17.5 44.5 39.9l.3 4.9c0 22.7-16.9 41.7-39.6 44.5l-5.2.3h-66.2v66.1c0 23.1-17.5 42.1-39.9 44.6l-4.9.2c-22.7 0-41.7-16.9-44.4-39.5l-.4-5.3v-66.1h-66.1c-23.1 0-42.1-17.5-44.5-39.9l-.3-4.9c0-22.7 16.9-41.7 39.6-44.5l5.2-.3h66.1v-66.1c0-23.1 17.5-42.1 40-44.6l4.8-.2z'/></svg>
                ) : (
                  <ShoppingCart size={16} />
                )}
              </button>
            ) : (
              <FloatingCartButton 
                product={product} 
                cartItem={cartItem} 
                variantId={singleVariant?.id} 
                color={cartButtonColor}
                iconType={cartButtonIcon}
              />
            )}
          </div>
        )}

        {/* Add to Cart Button — desktop hover panel only */}
        {showActions && cartButtonVariant === "normal" && (
          <div
            className={cn(
              "hidden lg:block absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/40 to-transparent transition-all duration-500 ease-out z-20",
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
                variant={singleVariant}
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
            {formatPrice(product.price, undefined, locale)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-third line-through">
              {formatPrice(product.compareAtPrice, undefined, locale)}
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
