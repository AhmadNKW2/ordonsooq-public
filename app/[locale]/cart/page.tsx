"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft, Tag } from "lucide-react";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart();

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
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  {/* Product Image */}
                  <Link href={`/products/${item.product.slug}`} className="relative w-full sm:w-32 h-32 shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${item.product.slug}`}>
                        <h3 className="font-semibold text-primary hover:text-primary transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      {item.product.brand && (
                        <p className="text-sm text-third">{item.product.brand.name}</p>
                      )}
                      {item.variant && (
                        <p className="text-sm text-primary mt-1">{item.variant.name}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 sm:mt-0">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-primary">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-third">
                              {formatPrice(item.product.price)} each
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-2 text-third hover:text-secondary hover:bg-danger/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Continue Shopping */}
          <Link href="/products" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>

              {/* Coupon Code */}
              <div className="flex gap-2 mb-6">
                <Input placeholder="Coupon code" icon={Tag} />
                <Button
                  variant="solid"
                  className="bg-white hover:bg-white/90 shadow-gray-200/50 border border-gray-200 text-primary"
                >
                  Apply
                </Button>
              </div>

              {/* Summary Items */}
              <div className="space-y-4 pb-6 border-b border-gray-100">
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
              <div className="flex justify-between py-6 text-lg font-bold text-primary">
                <span>Total</span>
                <span className="text-primary">{formatPrice(finalTotal)}</span>
              </div>

              {/* Free Shipping Notice */}
              {totalPrice < 50 && (
                <div className="mb-6 p-4 bg-secondary/10 rounded-lg">
                  <p className="text-sm text-third">
                    Add <span className="font-bold text-primary">{formatPrice(50 - totalPrice)}</span> more to get{" "}
                    <span className="font-bold text-secondary">FREE shipping!</span>
                  </p>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all"
                      style={{ width: `${Math.min((totalPrice / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <Link href="/checkout">
                <Button size="lg" className="w-full">
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              {/* Secure Checkout Notice */}
              <p className="text-center text-sm text-third mt-4">
                🔒 Secure checkout powered by Stripe
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
