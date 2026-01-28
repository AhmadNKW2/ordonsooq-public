"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/useCheckout";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { cn, formatPrice } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";

export function CartSidebar() {
  const tCart = useTranslations("cart");
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const prefersReducedMotion = useReducedMotion();
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    totalAmount,
    loadingItems
  } = useCart();
  const { handleCheckout } = useCheckout();

  const closeCart = () => setIsOpen(false);

  const toNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const n = Number(value);
      return Number.isFinite(n) ? n : NaN;
    }
    return NaN;
  };

  const getEffectiveUnitPrice = (item: any): number => {
    const variant = item?.variant;
    const product = item?.product;

    const pick = (entity: any): number => {
      const price = toNumber(entity?.price);
      const salePrice = toNumber(entity?.sale_price);
      if (Number.isFinite(salePrice) && Number.isFinite(price) && salePrice > 0 && salePrice < price) return salePrice;
      return Number.isFinite(price) ? price : 0;
    };

    return variant ? pick(variant) : pick(product);
  };

  const getCompareAtUnitPrice = (item: any): number | undefined => {
    const variant = item?.variant;
    const product = item?.product;

    const pickCompare = (entity: any): number | undefined => {
      const price = toNumber(entity?.price);
      const salePrice = toNumber(entity?.sale_price);
      const compareAtPrice = toNumber(entity?.compareAtPrice);

      if (Number.isFinite(salePrice) && Number.isFinite(price) && salePrice > 0 && salePrice < price) return price;
      if (Number.isFinite(compareAtPrice) && Number.isFinite(price) && compareAtPrice > price) return compareAtPrice;
      return undefined;
    };

    return variant ? pickCompare(variant) : pickCompare(product);
  };

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        closeCart();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, closeCart]);

  return (
    <>
      {/* Backdrop (kept mounted for smoother open/close) */}
      <motion.div
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
        onClick={isOpen ? closeCart : undefined}
        className={cn(
          "fixed inset-0 bg-black/50 z-60",
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      />

      {/* Sidebar (kept mounted for smoother open/close) */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={tCart("title")}
        aria-hidden={!isOpen}
        initial={false}
        animate={{ x: isOpen ? 0 : isArabic ? "-100%" : "100%" }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }
        }
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "fixed top-0 bottom-0 h-full w-[92vw] max-w-md bg-white shadow-2xl z-70 flex flex-col transform-gpu will-change-transform",
          isArabic ? "left-0" : "right-0",
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-900">{tCart("title")} ({items.length})</h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-5">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{tCart("empty")}</h3>
              </div>
              <Button onClick={closeCart} variant="outline">
                {tCart("continueShopping")}
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-5 bg-white p-3 rounded-xl border border-gray-100 hover:border-primary/20 transition-colors">
                {(() => {
                  const productSlug = item.product.slug;
                  const productHref = item.variant_id
                    ? `/products/${productSlug}?variant=${item.variant_id}`
                    : `/products/${productSlug}`;
                  return (
                    <>
                      {/* Image */}
                      <Link href={productHref} onClick={closeCart} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name_en}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            width={80}
                            height={80}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <Link href={productHref} onClick={closeCart} className="font-medium text-gray-900 line-clamp-2 text-sm hover:underline">
                              {item.product.name_en}
                            </Link>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-danger transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {item.variant && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.variant.attributes.map(attr => `${attr.value_en}`).join(', ')}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <QuantitySelector
                            value={item.quantity}
                            onChange={(val) => updateQuantity(item.id, val)}
                            size="sm"
                            isLoading={loadingItems.has(item.id)}
                          />
                          {(() => {
                            const unitPrice = getEffectiveUnitPrice(item);
                            const unitCompareAt = getCompareAtUnitPrice(item);

                            return (
                              <div className="flex gap-2 items-center leading-tight">
                                <div className="flex items-center gap-2">
                                  {unitCompareAt && (
                                    <span className="text-xs text-gray-500 line-through">
                                      {formatPrice(unitCompareAt * item.quantity, undefined, locale)}
                                    </span>
                                  )}
                                </div>
                                <div className="font-bold text-primary">
                                  {formatPrice(unitPrice * item.quantity, undefined, locale)}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex flex-col gap-5 p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{tCart("subtotal")}</span>
                <span className="font-bold text-gray-900">{formatPrice(totalAmount, undefined, locale)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{tCart("shipping")}</span>
                <span className="text-green-600 font-medium">{tCart("freeShipping")}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/cart" onClick={closeCart}>
                <Button variant="outline" className="w-full" size="lg">
                  {tCart("viewCart")}
                </Button>
              </Link>
              <Button 
                className="w-full gap-2" 
                size="lg" 
                onClick={(e) => {
                  closeCart();
                  handleCheckout(e);
                }}
              >
                {tCart("checkout")} <ArrowRight className="w-4 h-4" />
              </Button>

            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
