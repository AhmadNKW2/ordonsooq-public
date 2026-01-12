"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Trash2, ShoppingBag, Truck, ArrowLeft, Tag, ArrowRight } from "lucide-react";
import { Button, Card, PageWrapper, QuantitySelector, Input, IconButton, Breadcrumb } from "@/components/ui";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice, calculateDiscount, cn, slugify } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  const toNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const n = Number(value);
      return Number.isFinite(n) ? n : NaN;
    }
    return NaN;
  };

  const getEffectivePricing = (entity: unknown): { price: number; compareAtPrice?: number } => {
    const e = entity as any;
    const price = toNumber(e?.price);
    const compareAtPrice = toNumber(e?.compareAtPrice);
    const salePrice = toNumber(e?.sale_price);

    if (Number.isFinite(salePrice) && Number.isFinite(price) && salePrice > 0 && salePrice < price) {
      return { price: salePrice, compareAtPrice: price };
    }

    const normalizedCompareAt = Number.isFinite(compareAtPrice) && Number.isFinite(price) && compareAtPrice > price
      ? compareAtPrice
      : undefined;

    return { price: Number.isFinite(price) ? price : 0, compareAtPrice: normalizedCompareAt };
  };

  const shipping = totalPrice > 50 ? 0 : 9.99;
  const tax = totalPrice * 0.1;
  const finalTotal = totalPrice + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-third" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-4">Your Cart is Empty</h1>
          <p className="text-third mb-8">
            Looks like you haven&apos;t added anything to your cart yet. Start shopping and find something you love!
          </p>
          <Link href="/products">
            <Button size="lg">
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper className="container mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Cart" }
        ]}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Shopping Cart</h1>
          <p className="text-third">{totalItems} items in your cart</p>
        </div>
        <Button
          variant="solid"
          onClick={clearCart}
          className="bg-gray-100 hover:bg-gray-200 shadow-gray-200/50 text-secondary hover:text-secondary"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cart Items */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {items.map((item) => {
            const productPricing = getEffectivePricing(item.product);
            const variantPricing = item.variant ? getEffectivePricing(item.variant) : undefined;

            const unitPrice = (variantPricing?.price ?? productPricing.price) || 0;
            const unitCompareAtPrice = variantPricing?.compareAtPrice ?? productPricing.compareAtPrice;

            const discount = unitCompareAtPrice ? calculateDiscount(unitCompareAtPrice, unitPrice) : 0;
            const productSlug = item.product.slug || `${slugify(item.product.name_en)}-${item.product_id}`;
            const productHref = item.variant_id
              ? `/products/${productSlug}?variant=${item.variant_id}`
              : `/products/${productSlug}`;

            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="p-0">
                  <div className="flex flex-col sm:flex-row gap-5 p-4">
                    {/* Product Image */}
                    <Link href={productHref} className="relative w-full sm:w-32 h-32 shrink-0">
                      <Image
                        src={item.product.image || '/placeholder.svg'}
                        alt={item.product.name_en}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={productHref}>
                            <h3 className="font-semibold text-primary hover:text-primary transition-colors">
                              {item.product.name_en}
                            </h3>
                          </Link>
                          {/* Brand - unavailable in CartProduct currently
                          {item.product.brand && (
                            <p className="text-sm text-third">{item.product.brand.name}</p>
                          )}
                          */}
                          {item.variant && item.variant.attributes && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.variant.attributes.map((attr, idx) => (
                                <span key={idx} className="text-xs text-third bg-gray-100 px-2 py-1 rounded">
                                  {attr.attribute_name_en}: {attr.value_en}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Price Display (Top Right) */}
                        <div className="flex flex-col gap-3 text-right">
                          <div className="flex gap-2 items-center justify-center">
                            {unitCompareAtPrice && (
                              <span className="text-xs text-third line-through">
                                {formatPrice(unitCompareAtPrice * item.quantity)}
                              </span>
                            )}
                            {discount > 0 && (
                              <span className="text-xs text-danger font-medium bg-danger/10 px-1.5 py-0.5 rounded">
                                -{discount}%
                              </span>
                            )}
                          </div>

                          <span className="font-bold text-primary text-lg">
                            {formatPrice(unitPrice * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-xs text-third mt-1">
                              {formatPrice(unitPrice)} each
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 sm:mt-0">
                        <div className="flex items-center gap-3">
                          {/* Quantity Selector */}
                          <QuantitySelector
                            value={item.quantity}
                            onChange={(val) => updateQuantity(item.id, val)}
                            max={item.product.stock}
                          />

                          {/* Wishlist Button */}
                          <IconButton
                            icon="heart"
                            onClick={() => toggleItem(item.product)}
                            isActive={isInWishlist(item.product.id)}
                            variant="wishlist"
                            className="border border-gray-200"
                            aria-label="Add to wishlist"
                          />
                        </div>

                        {/* Remove Button */}
                        <IconButton
                          icon="trash"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                          variant="wishlist"
                          className="border border-gray-200"

                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-46">
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-primary">Order Summary</h2>

              {/* Coupon Code */}
              <div className="flex gap-2">
                <Input placeholder="Coupon code" icon={Tag} />
                <Button
                  variant="solid"
                  className="bg-white hover:bg-white/90 shadow-gray-200/50 border border-gray-200 text-primary"
                >
                  Apply
                </Button>
              </div>

              {/* Summary Items */}
              <div className="flex flex-col gap-5 pb-5 border-b border-gray-100">
                <div className="flex justify-between text-third">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-third">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-secondary font-medium" : ""}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-third">
                  <span>Tax (10%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Total</span>
                <span className="text-primary">{formatPrice(finalTotal)}</span>
              </div>

              {/* Free Shipping Progress */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-secondary" />
                  <p className="text-sm font-medium text-primary flex-1">
                    {totalPrice >= 50
                      ? "Free shipping unlocked!"
                      : `Add ${formatPrice(50 - totalPrice)} for `}
                    spa
                  </p>
                  <span className="text-xs font-bold text-secondary">{Math.min(Math.round((totalPrice / 50) * 100), 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${Math.min((totalPrice / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout">
                <Button size="lg" className="w-full">
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              {/* Secure Checkout Notice */}
              <p className="text-center text-sm text-third">
                🔒 Secure checkout powered by Stripe
              </p>
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
