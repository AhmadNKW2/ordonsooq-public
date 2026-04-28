"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { Button, Card, QuantitySelector, IconButton, Breadcrumb } from "@/components/ui";
import { useCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/useCheckout";
import { useWishlist } from "@/hooks/use-wishlist";
import { FREE_SHIPPING_MIN_ORDER_AMOUNT, STANDARD_SHIPPING_FEE } from "@/lib/constants";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

export function CartPageClient() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice, loadingItems } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { handleCheckout } = useCheckout();
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  const toNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const numericValue = Number(value);
      return Number.isFinite(numericValue) ? numericValue : Number.NaN;
    }
    return Number.NaN;
  };

  const getEffectivePricing = (entity: unknown): { price: number; compareAtPrice?: number } => {
    const candidate = entity as {
      price?: unknown;
      compareAtPrice?: unknown;
      sale_price?: unknown;
    };
    const price = toNumber(candidate?.price);
    const compareAtPrice = toNumber(candidate?.compareAtPrice);
    const salePrice = toNumber(candidate?.sale_price);

    if (Number.isFinite(salePrice) && Number.isFinite(price) && salePrice > 0 && salePrice < price) {
      return { price: salePrice, compareAtPrice: price };
    }

    const normalizedCompareAt =
      Number.isFinite(compareAtPrice) && Number.isFinite(price) && compareAtPrice > price
        ? compareAtPrice
        : undefined;

    return { price: Number.isFinite(price) ? price : 0, compareAtPrice: normalizedCompareAt };
  };

  const totalSavings = items.reduce((accumulator, item) => {
    const pricing = item.variant ? getEffectivePricing(item.variant) : getEffectivePricing(item.product);
    if (pricing.compareAtPrice && pricing.compareAtPrice > pricing.price) {
      return accumulator + (pricing.compareAtPrice - pricing.price) * item.quantity;
    }
    return accumulator;
  }, 0);

  const freeShippingUnlocked = totalPrice >= FREE_SHIPPING_MIN_ORDER_AMOUNT;
  const remainingAmountForFreeShipping = Math.max(FREE_SHIPPING_MIN_ORDER_AMOUNT - totalPrice, 0);
  const freeShippingProgress = Math.min((totalPrice / FREE_SHIPPING_MIN_ORDER_AMOUNT) * 100, 100);
  const shipping = freeShippingUnlocked ? 0 : STANDARD_SHIPPING_FEE;
  const finalTotal = totalPrice + shipping;
  const getProductName = (item: typeof items[number]) =>
    isArabic
      ? item.product.name_ar || item.product.name_en || ""
      : item.product.name_en || item.product.name_ar || "";

  const getVariantValue = (attribute: NonNullable<typeof items[number]["variant"]>["attributes"][number]) =>
    isArabic
      ? attribute.value_ar || attribute.value_en
      : attribute.value_en || attribute.value_ar;

  if (items.length === 0) {
    return (
      <div className="px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-third" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-4">{t("empty")}</h1>
          <p className="text-third mb-8">{t("emptyDesc")}</p>
          <Link href="/products">
            <Button size="lg">
              <ShoppingBag className="w-5 h-5" />
              {t("startShopping")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: t("title") }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">{t("title")}</h1>
          <p className="text-third">{t("itemsInCart", { count: totalItems })}</p>
        </div>
        <Button
          variant="solid"
          onClick={clearCart}
          className="bg-gray-100 hover:bg-gray-200 shadow-gray-200/50 text-secondary hover:text-secondary"
        >
          <Trash2 className="w-4 h-4" />
          {t("clearCart")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-32 lg:pb-0">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {items.map((item) => {
            const productPricing = getEffectivePricing(item.product);
            const variantPricing = item.variant ? getEffectivePricing(item.variant) : undefined;

            const unitPrice = variantPricing?.price ?? productPricing.price ?? 0;
            const unitCompareAtPrice = variantPricing?.compareAtPrice ?? productPricing.compareAtPrice;
            const discount = unitCompareAtPrice ? calculateDiscount(unitCompareAtPrice, unitPrice) : 0;
            const productSlug = item.product.slug;
            const productHref = item.variant_id
              ? `/products/${productSlug}?variant=${item.variant_id}`
              : `/products/${productSlug}`;

            return (
              <Card key={item.id} className="group overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex gap-4">
                  <Link
                    href={productHref}
                    className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
                  >
                    <Image
                      src={item.product.image || "/placeholder.svg"}
                      alt={getProductName(item)}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 pr-2">
                        <Link href={productHref}>
                          <h3 className="font-semibold text-primary line-clamp-2 hover:text-secondary transition-colors text-base sm:text-lg leading-tight">
                            {getProductName(item)}
                          </h3>
                        </Link>

                        {item.variant && item.variant.attributes ? (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.variant.attributes.map((attribute, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100">
                                {getVariantValue(attribute)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="h-1.5"></div>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-danger hover:bg-red-50 p-1.5 rounded-lg transition-all"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                          {unitCompareAtPrice ? (
                            <span className="text-xs text-gray-400 line-through decoration-gray-300">
                              {formatPrice(unitCompareAtPrice)}
                            </span>
                          ) : null}
                          {discount > 0 ? (
                            <span className="text-[10px] font-bold text-danger bg-danger/10 px-1.5 py-0.5 rounded-full">
                              -{discount}%
                            </span>
                          ) : null}
                        </div>
                        <span className="font-bold text-secondary text-lg sm:text-xl tracking-tight">
                          {formatPrice(unitPrice)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <IconButton
                          icon="heart"
                          onClick={() => toggleItem(item.product, item.variant_id ?? null)}
                          isActive={isInWishlist(item.product.id, item.variant_id ?? null)}
                          variant="wishlist"
                          className={cn(
                            "hidden border-none shadow-none hover:bg-gray-50 sm:inline-flex",
                            isInWishlist(item.product.id, item.variant_id ?? null) ? "text-red-500" : "text-gray-400",
                          )}
                        />

                        <div className="scale-90 sm:scale-100 origin-right">
                          <QuantitySelector
                            value={item.quantity}
                            onChange={(value) => updateQuantity(item.id, value)}
                            max={item.product.stock}
                            isLoading={loadingItems.has(item.id)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="hidden lg:block lg:col-span-1">
          <Card className="sticky top-46">
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-primary">{t("orderSummary")}</h2>

              <div className="flex flex-col gap-5 pb-5 border-b border-gray-100">
                <div className="flex justify-between text-third">
                  <span>{t("subtotalWithCount", { count: totalItems })}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-third">
                  <span>{t("shipping")}</span>
                  <span className={shipping === 0 ? "text-secondary font-medium" : ""}>
                    {shipping === 0 ? t("free") : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-primary">
                <span>{t("total")}</span>
                <span className="text-primary">{formatPrice(finalTotal)}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-secondary" />
                  <p className="text-sm font-medium text-primary flex-1">
                    {freeShippingUnlocked
                      ? t("freeShippingUnlocked")
                      : t("addAmountForFreeShipping", { amount: formatPrice(remainingAmountForFreeShipping, undefined, locale) })}
                  </p>
                  <span className="text-xs font-bold text-secondary">
                    {Math.round(freeShippingProgress)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={handleCheckout}>
                {t("proceedToCheckout")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:hidden">
        <AnimatePresence>
          {isMobileSummaryOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="border-b border-gray-100 bg-white"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">{t("orderSummary")}</span>
                  <span className="text-sm text-third">({totalItems} items)</span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm text-third">
                    <span>{t("subtotal")}</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-third">
                    <span>{t("shipping")}</span>
                    <span className={shipping === 0 ? "text-secondary font-medium" : ""}>
                      {shipping === 0 ? t("free") : formatPrice(shipping)}
                    </span>
                  </div>
                </div>

                <div className="py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-3 h-3 text-secondary" />
                    <p className="text-xs font-medium text-primary flex-1">
                      {freeShippingUnlocked
                        ? t("freeShippingUnlocked")
                        : t("addAmountForFreeShipping", { amount: formatPrice(remainingAmountForFreeShipping, undefined, locale) })}
                    </p>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex items-center justify-between p-4 gap-4 bg-white">
          <div className="flex flex-col cursor-pointer min-w-30" onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}>
            <div className="flex items-center gap-2 select-none">
              <span className="font-bold text-primary text-xl tracking-tight">{formatPrice(finalTotal)}</span>
              {isMobileSummaryOpen ? (
                <ChevronDown className="w-4 h-4 text-primary" />
              ) : (
                <ChevronUp className="w-4 h-4 text-primary" />
              )}
            </div>
            {totalSavings > 0 && (
              <span className="text-xs text-secondary font-semibold">Saving {formatPrice(totalSavings)}</span>
            )}
          </div>

          <Button
            size="lg"
            className="flex-1 w-full bg-secondary hover:bg-secondary/90 text-white rounded-lg shadow-lg shadow-secondary/20"
            onClick={handleCheckout}
          >
            {t("checkout").toUpperCase()}
          </Button>
        </div>
      </div>
    </>
  );
}