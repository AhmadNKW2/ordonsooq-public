"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { cn, formatPrice, slugify } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function CartSidebar() {
  const tCart = useTranslations("cart");
  const { 
    items, 
    isOpen, 
    setIsOpen,
    removeItem, 
    updateQuantity, 
    totalAmount
  } = useCart();
  
  const closeCart = () => setIsOpen(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
        closeCart();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeCart]);

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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-60 backdrop-blur-[3px]"
          />

          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-100 bg-white shadow-2xl z-70 flex flex-col"
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
                      const productSlug = item.product.slug || `${slugify(item.product.name_en)}-${item.product_id}`;
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
                        />
                        {(() => {
                          const unitPrice = getEffectiveUnitPrice(item);
                          const unitCompareAt = getCompareAtUnitPrice(item);

                          return (
                            <div className="flex gap-2 items-center leading-tight">
                              <div className="flex items-center gap-2">
                                {unitCompareAt && (
                                  <span className="text-xs text-gray-500 line-through">
                                    {formatPrice(unitCompareAt * item.quantity)}
                                  </span>
                                )}
                              </div>
                              <div className="font-bold text-primary">
                                {formatPrice(unitPrice * item.quantity)}
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
                    <span className="font-bold text-gray-900">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{tCart("shipping")}</span>
                        <span className="text-green-600 font-medium">{tCart("freeShipping")}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Link href="/checkout" onClick={closeCart}>
                    <Button className="w-full gap-2" size="lg">
                          {tCart("checkout")} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/cart" onClick={closeCart}>
                    <Button variant="outline" className="w-full" size="lg">
                          {tCart("viewCart")}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
