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
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

// ─── Mobile Particles (same as desktop) ──────────────────────────────────────

function mobileMulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function MobileParticle({ index }: { index: number }) {
  const rand = mobileMulberry32(index + 1);
  const angle    = rand() * 360;
  const distance = rand() * 80 + 40;
  const rotate   = rand() * 360;
  const duration = 0.55 + rand() * 0.35;
  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 0 }}
      animate={{
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance,
        scale: [0, 1, 0],
        opacity: [1, 1, 0],
        rotate,
      }}
      transition={{ duration, ease: 'easeOut' }}
      className={cn(
        'absolute h-2 w-2 rounded-full pointer-events-none',
        index % 3 === 0 ? 'bg-yellow-400' :
        index % 3 === 1 ? 'bg-indigo-500' : 'bg-pink-500',
      )}
    />
  );
}

function MobileParticles() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
      {Array.from({ length: 12 }).map((_, i) => (
        <MobileParticle key={i} index={i} />
      ))}
    </div>
  );
}

// ─── Mobile Cart Button ──────────────────────────────────────────────────────

interface MobileCartButtonProps {
  product: Product;
  cartItem: ReturnType<typeof useCart>['items'][number] | undefined;
}

function MobileCartButton({ product, cartItem }: MobileCartButtonProps) {
  const t = useTranslations('product');
  const { addItem, updateQuantity, loadingItems } = useCart();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isUpdating, setIsUpdating] = useState(false);
  const MIN_MS = 650;
  const SUCCESS_HOLD = 750;

  const quantity  = cartItem ? cartItem.quantity : 0;
  const isItemLoading = cartItem ? loadingItems.has(cartItem.id) : false;
  const maxStock  = product.stock;
  const isAtMax   = maxStock > 0 && quantity >= maxStock;

  // Show quantity pill when item is in cart and no animation is running
  const showQty = quantity > 0 && status === 'idle';

  const handleAdd = () => {
    if (status !== 'idle' || product.stock === 0) return;
    const startedAt = Date.now();
    setStatus('loading');
    addItem(product as any, 1, undefined, {
      openSidebar: false,
      onSuccess: () => {
        const elapsed = Date.now() - startedAt;
        const wait = Math.max(0, MIN_MS - elapsed);
        window.setTimeout(() => {
          setStatus('success');
          window.setTimeout(() => setStatus('idle'), SUCCESS_HOLD);
        }, wait);
      },
      onError: () => setStatus('idle'),
    });
  };

  const handleChange = (val: number) => {
    setIsUpdating(true);
    updateQuantity(cartItem!.id, val, {
      onSuccess: () => setIsUpdating(false),
      onError:   () => setIsUpdating(false),
    });
  };

  return (
    <div className="relative flex items-center justify-end">
      {/* Particles burst on success */}
      <AnimatePresence>
        {status === 'success' && <MobileParticles />}
      </AnimatePresence>

      {/* Single morphing pill/circle — `layout` smoothly animates size changes */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-full shadow-lg text-white',
          'h-9',
          showQty
            ? 'bg-secondary'
            : status === 'success'
            ? 'bg-green-500'
            : 'bg-secondary',
          !showQty && 'w-9 cursor-pointer',
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>

          {/* ── Quantity pill content ── */}
          {showQty && (
            <motion.div
              key="qty-row"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="flex items-center"
            >
              <button
                type="button"
                disabled={isItemLoading || isUpdating}
                onClick={() => handleChange(quantity - 1)}
                className="h-9 w-9 flex items-center justify-center active:bg-white/20 transition-colors disabled:opacity-50"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={quantity === 1 ? 'trash' : 'minus'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1,   opacity: 1 }}
                    exit={{   scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    {quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                  </motion.span>
                </AnimatePresence>
              </button>

              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={quantity}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0,  opacity: 1 }}
                  exit={{   y: -10, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="w-6 text-center text-xs font-bold tabular-nums"
                >
                  {(isItemLoading || isUpdating)
                    ? <Loader2 size={11} className="animate-spin mx-auto" />
                    : quantity}
                </motion.span>
              </AnimatePresence>

              <button
                type="button"
                disabled={isAtMax || isItemLoading || isUpdating}
                onClick={() => handleChange(quantity + 1)}
                className="h-9 w-9 flex items-center justify-center active:bg-white/20 transition-colors disabled:opacity-50"
              >
                <Plus size={13} />
              </button>
            </motion.div>
          )}

          {/* ── Circle icon states ── */}
          {!showQty && status === 'idle' && (
            <motion.button
              key="idle"
              type="button"
              aria-label={t('addToCart')}
              disabled={product.stock === 0}
              onClick={handleAdd}
              whileTap={{ scale: 0.82 }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{   scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center disabled:opacity-50"
            >
              <ShoppingCart size={16} />
            </motion.button>
          )}

          {!showQty && status === 'loading' && (
            <motion.div
              key="loading"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{   scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Loader2 size={16} className="animate-spin" />
              {/* progress bar fill */}
              <motion.div
                className="absolute bottom-0 left-0 top-0 bg-white/20 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: MIN_MS / 1000, ease: 'linear' }}
              />
            </motion.div>
          )}

          {!showQty && status === 'success' && (
            <motion.div
              key="success"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{   scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="rounded-full bg-white/20 p-0.5">
                <Check size={15} strokeWidth={4} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

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
          className="object-cover group-hover:scale-110 transition-transform duration-500"
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
        {showActions && quantity > 0 && (
          <div className="hidden lg:block absolute bottom-3 right-3 z-10 transition-opacity duration-300 opacity-100 group-hover:opacity-0 pointer-events-none">
            <div className="flex items-center gap-1 bg-secondary/90 backdrop-blur-sm text-white px-2 py-1 rounded-full shadow-lg text-xs font-bold">
              <ShoppingCart size={14} />
              <span>{quantity}</span>
            </div>
          </div>
        )}

        {/* Mobile: always-visible animated cart button — hidden on desktop */}
        {showActions && (
          <div
            className="lg:hidden absolute bottom-3 right-3 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {hasVariants ? (
              <button
                type="button"
                aria-label={t('product.chooseOptions')}
                onClick={() => router.push(productHref)}
                className="h-9 w-9 rounded-full bg-secondary text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
              >
                <ShoppingCart size={16} />
              </button>
            ) : (
              <MobileCartButton product={product} cartItem={cartItem} />
            )}
          </div>
        )}

        {/* Add to Cart Button — desktop hover panel only */}
        {showActions && (
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
