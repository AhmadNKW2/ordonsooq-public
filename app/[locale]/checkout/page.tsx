"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowLeft, CreditCard, Truck, MapPin, User, Lock, Check, ChevronRight } from "lucide-react";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, cn } from "@/lib/utils";
import { SHIPPING_OPTIONS, PAYMENT_METHODS } from "@/lib/constants";

type CheckoutStep = "shipping" | "payment" | "review";

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_OPTIONS[0].id);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const selectedShipping = SHIPPING_OPTIONS.find((s) => s.id === shippingMethod)!;
  const shipping = totalPrice > 50 && selectedShipping.price > 0 ? 0 : selectedShipping.price;
  const tax = totalPrice * 0.1;
  const finalTotal = totalPrice + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setOrderComplete(true);
    clearCart();
  };

  const steps = [
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "review", label: "Review", icon: Check },
  ];

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Items in Cart</h1>
          <p className="text-gray-500 mb-8">
            Please add some items to your cart before checking out.
          </p>
          <Link href="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-gray-500 mb-2">
            Thank you for your purchase. Your order number is:
          </p>
          <p className="text-xl font-bold text-primary mb-6">#ORD-{Date.now().toString().slice(-8)}</p>
          <p className="text-gray-500 mb-8">
            We&apos;ve sent a confirmation email to {formData.email || "your email"}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button color="white">Continue Shopping</Button>
            </Link>
            <Button>Track Order</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link href="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      {/* Page Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => {
                if (index < steps.findIndex((s) => s.id === currentStep)) {
                  setCurrentStep(step.id as CheckoutStep);
                }
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                currentStep === step.id
                  ? "bg-primary text-white"
                  : steps.findIndex((s) => s.id === currentStep) > index
                  ? "bg-success/10 text-success cursor-pointer"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              <step.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 text-gray-300 mx-2" />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {/* Shipping Step */}
              {currentStep === "shipping" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Shipping Information
                  </h2>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                    />
                    <Input
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 234 567 890"
                    />
                  </div>

                  {/* Address */}
                  <Input
                    label="Street Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St, Apt 4"
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Input
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                      className="col-span-2 sm:col-span-1"
                    />
                    <Input
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="NY"
                    />
                    <Input
                      label="ZIP Code"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                    />
                    <Input
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>

                  {/* Shipping Method */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-primary" />
                      Shipping Method
                    </h3>
                    <div className="space-y-3">
                      {SHIPPING_OPTIONS.map((option) => (
                        <label
                          key={option.id}
                          className={cn(
                            "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all",
                            shippingMethod === option.id
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              value={option.id}
                              checked={shippingMethod === option.id}
                              onChange={(e) => setShippingMethod(e.target.value)}
                              className="w-4 h-4 text-primary"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{option.name}</p>
                              <p className="text-sm text-gray-500">{option.description}</p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {option.price === 0 ? "FREE" : formatPrice(option.price)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button size="lg" className="w-full" onClick={() => setCurrentStep("payment")}>
                    Continue to Payment
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {/* Payment Step */}
              {currentStep === "payment" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Information
                  </h2>

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium text-gray-900">{method.name}</span>
                      </label>
                    ))}
                  </div>

                  {/* Card Details */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <Input
                        label="Card Number"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        icon={CreditCard}
                      />
                      <Input
                        label="Cardholder Name"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        icon={User}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Expiry Date"
                          name="expiry"
                          value={formData.expiry}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                        />
                        <Input
                          label="CVV"
                          name="cvv"
                          type="password"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="•••"
                          icon={Lock}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button color="white" size="lg" onClick={() => setCurrentStep("shipping")}>
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </Button>
                    <Button size="lg" className="flex-1" onClick={() => setCurrentStep("review")}>
                      Review Order
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {currentStep === "review" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Review Your Order
                  </h2>

                  {/* Shipping Summary */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Shipping Address</h3>
                      <button
                        onClick={() => setCurrentStep("shipping")}
                        className="text-sm text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-gray-600">
                      {formData.firstName} {formData.lastName}<br />
                      {formData.address}<br />
                      {formData.city}, {formData.state} {formData.zipCode}<br />
                      {formData.country}
                    </p>
                  </div>

                  {/* Payment Summary */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Payment Method</h3>
                      <button
                        onClick={() => setCurrentStep("payment")}
                        className="text-sm text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-gray-600">
                      {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name}
                      {paymentMethod === "card" && formData.cardNumber && (
                        <span> ending in {formData.cardNumber.slice(-4)}</span>
                      )}
                    </p>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="relative w-16 h-16 shrink-0">
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button color="white" size="lg" onClick={() => setCurrentStep("payment")}>
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={handlePlaceOrder}
                      isLoading={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Place Order"}
                      <Lock className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Items Preview */}
              <div className="space-y-3 pb-4 border-b border-gray-100">
                {items.slice(0, 3).map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{items.length - 3} more items
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-3 py-4 border-b border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-success font-medium" : ""}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between py-4 text-lg font-bold text-gray-900">
                <span>Total</span>
                <span className="text-primary">{formatPrice(finalTotal)}</span>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
                <Lock className="w-4 h-4" />
                <span>Secure checkout</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
