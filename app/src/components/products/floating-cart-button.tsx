"use client";

import { useState } from "react";
import { Check, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useTranslations } from "next-intl";

// ─── Particles ───────────────────────────────────────────────────────────────

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

// ─── Floating Cart Button ──────────────────────────────────────────────────────

export interface FloatingCartButtonProps {
  product: Product;
  cartItem: ReturnType<typeof useCart>['items'][number] | undefined;
  variantId?: string | number;
  color?: "blue" | "white";
  iconType?: "shopping-cart" | "add-to-cart";
  onAnimationEnd?: () => void;
}

export function FloatingCartButton({ product, cartItem, variantId, color = "blue", iconType = "shopping-cart", onAnimationEnd }: FloatingCartButtonProps) {
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
    addItem(product as any, 1, variantId, {
      openSidebar: false,
      onSuccess: () => {
        const elapsed = Date.now() - startedAt;
        const wait = Math.max(0, MIN_MS - elapsed);
        window.setTimeout(() => {
          setStatus('success');
          window.setTimeout(() => {
            setStatus('idle');
            onAnimationEnd?.();
          }, SUCCESS_HOLD);
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
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-full shadow-lg transition-colors',
          'h-9',
          color === "white" ? "bg-white text-secondary hover:bg-gray-50 border border-secondary" : "bg-secondary text-white",
          showQty
            ? (color === "white" ? 'bg-white' : 'bg-secondary')
            : status === 'success'
            ? 'bg-green-500 text-white'
            : (color === "white" ? 'bg-white' : 'bg-secondary'),
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center disabled:opacity-50"
            >
              {iconType === "add-to-cart" ? (
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' className="w-5 h-5 pointer-events-none" fill='currentColor' overflow='hidden'><path d='M409.7 752.4c31.8 0 57.6 25.8 57.5 57.6 0 31.8-25.8 57.6-57.5 57.6-31.8 0-57.6-25.8-57.6-57.6s25.8-57.6 57.6-57.6zm327.5 0c31.8 0 57.6 25.8 57.6 57.6s-25.8 57.6-57.6 57.6-57.6-25.8-57.5-57.6c0-31.8 25.8-57.6 57.5-57.6zm-541-563.2c21.6 0 40.7 4.8 60.2 16.6 20.9 12.6 37 31.5 47.1 55.9l3.6 9.7 1.5 6.2 18.5 113.1 31.4 199.2c2.9 17.9 17.5 31.7 35.1 33.7l4.9.3h347.2c18.3 0 34.2-12.3 39.1-30.1l1.1-5.2 48.6-260.5c4.5-24.3 27.9-40.4 52.3-35.8 22.3 4.2 37.9 24.3 36.5 47.1l-.7 5.1L874.2 604c-9.7 60.2-59.9 105.6-120.8 109.2l-7.7.3H398.5c-63.8 0-118.1-46.2-128.5-109.4l-36.3-230.3-12.4-76.3-1-2.5c-2.1-4.9-4.7-8.4-7.5-10.6l-2.7-1.9c-3.3-2-6.8-3.1-10.1-3.5l-3.8-.2h-85.3c-24.7 0-44.8-20.1-44.8-44.8 0-22.7 16.9-41.7 39.6-44.5l5.2-.3h85.3zm382.2-1.2c22.7 0 41.7 16.9 44.5 39.6l.3 5.2v66.1h66.2c23.1 0 42.1 17.5 44.5 39.9l.3 4.9c0 22.7-16.9 41.7-39.6 44.5l-5.2.3h-66.2v66.1c0 23.1-17.5 42.1-39.9 44.6l-4.9.2c-22.7 0-41.7-16.9-44.4-39.5l-.4-5.3v-66.1h-66.1c-23.1 0-42.1-17.5-44.5-39.9l-.3-4.9c0-22.7 16.9-41.7 39.6-44.5l5.2-.3h66.1v-66.1c0-23.1 17.5-42.1 40-44.6l4.8-.2z'/></svg>
              ) : (
                <ShoppingCart size={16} className="pointer-events-none" />
              )}
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
