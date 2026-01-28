"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, CreditCard, Truck, MapPin, User, Lock, Check, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { Button, Input, Card, Radio } from "@/components/ui";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice, cn } from "@/lib/utils";
import { SHIPPING_OPTIONS, PAYMENT_METHODS } from "@/lib/constants";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { AnimatePresence, motion } from "framer-motion";

type CheckoutStep = "shipping" | "payment" | "review";

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tProfile = useTranslations('profile');
  const locale = useLocale();
  const { isLoading: isAuthLoading } = useAuth();
  const { items, totalItems, totalPrice, clearCart, isLoading: isCartLoading } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_OPTIONS[0].id);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    building: "",
    floor: "",
    apartment: "",
    city: "",
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
    { id: "shipping", label: t('steps.shipping'), icon: Truck },
    { id: "payment", label: t('steps.payment'), icon: CreditCard },
    { id: "review", label: t('steps.review'), icon: Check },
  ];

  if (isCartLoading || isAuthLoading) {
    return <PageSkeleton />;
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">{t('noItems')}</h1>
          <p className="text-third mb-8">
            {t('noItemsDesc')}
          </p>
          <Link href="/products">
            <Button size="lg">{t('browseProducts')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">{t('orderConfirmed')}</h1>
          <p className="text-third mb-2">
            {t('orderConfirmedDesc')}
          </p>
          <p className="text-xl font-bold text-primary mb-6">#ORD-{Date.now().toString().slice(-8)}</p>
          <p className="text-third mb-8">
            We&apos;ve sent a confirmation email to {formData.email || "your email"}.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/products">
              <Button
                variant="solid"
                className="bg-white hover:bg-white/90 shadow-gray-200/50 border border-gray-200 text-primary"
              >
                {t('continueShopping')}
              </Button>
            </Link>
            <Button>{t('trackOrder')}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Page Header */}
        <h1 className="text-3xl font-bold text-primary">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <Link href="/cart">
              <Button
                backgroundColor="var(--color-secondary)"
                textColor="#ffffff"
                className="h-auto shadow-none hover:shadow-none hover:scale-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Cart</span>
              </Button>
            </Link>
            <ChevronRight className="w-5 h-5 text-third mx-2" />
          </div>
          {steps.map((step, index) => {
            const isCurrent = currentStep === step.id;
            const isCompleted = steps.findIndex((s) => s.id === currentStep) > index;

            return (
              <div key={step.id} className="flex items-center">
                <Button
                  onClick={() => setCurrentStep(step.id as CheckoutStep)}
                  disabled={!isCompleted && !isCurrent}
                  variant={isCurrent ? "solid" : undefined}
                  backgroundColor={
                    isCurrent
                      ? undefined
                      : isCompleted
                        ? "var(--color-secondary)"
                        : "#e5e7eb"
                  }
                  textColor={
                    isCurrent
                      ? undefined
                      : isCompleted
                        ? "#ffffff"
                        : "var(--color-third)"
                  }
                  className="h-auto shadow-none hover:shadow-none hover:scale-100"
                >
                  <step.icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{step.label}</span>
                </Button>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-third mx-2" />
                )}
              </div>
            );
          })}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            {/* Shipping Step */}
            {currentStep === "shipping" && (
              <div className="flex flex-col gap-5">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {t('shippingInfo')}
                </h2>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { name: "firstName", label: t('firstName'), placeholder: "John" },
                    { name: "lastName", label: t('lastName'), placeholder: "Doe" },
                    { name: "email", label: t('email'), type: "email", placeholder: "john@example.com" },
                    { name: "phone", label: t('phone'), type: "tel", placeholder: "0791234567" },
                  ].map((field) => (
                    <Input
                      key={field.name}
                      label={field.label}
                      name={field.name}
                      type={field.type}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                    />
                  ))}
                </div>

                {/* Address */}
                <Input
                  label={t('address')}
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St"
                />

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-5">
                  {[
                    { name: "building", label: t('building'), placeholder: "12" },
                    { name: "floor", label: t('floor'), placeholder: "3" },
                    { name: "apartment", label: t('apartment'), placeholder: "4B" },
                    { name: "city", label: t('city'), placeholder: "Amman" },
                  ].map((field) => (
                    <Input
                      key={field.name}
                      label={field.label}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === "payment" && (
              <div className="flex flex-col gap-5">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-6">
                  <CreditCard className="w-5 h-5 text-primary" />
                  {t('paymentInfo')}
                </h2>

                {/* Payment Methods */}
                <div className="flex flex-col gap-3">
                  <Radio
                    variant="item"
                    name="payment"
                    value="cod"
                    checked={true}
                    readOnly
                    label={
                      <span className="flex items-center gap-3">
                        <span className="text-2xl">💵</span>
                        <span>{t('cod')}</span>
                      </span>
                    }
                  />
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === "review" && (
              <div className="flex flex-col gap-5">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-6">
                  <Check className="w-5 h-5 text-primary" />
                  {t('reviewOrder')}
                </h2>

                {/* Shipping Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-primary">{t('shippingAddress')}</h3>
                    <button
                      onClick={() => setCurrentStep("shipping")}
                      className="text-sm text-primary hover:underline"
                    >
                      {t('edit')}
                    </button>
                  </div>
                  <p className="text-third">
                    {formData.firstName} {formData.lastName}<br />
                    {formData.address}<br />
                    {formData.building}, {formData.floor}, {formData.apartment}<br />
                    {formData.city}
                  </p>
                </div>

                {/* Payment Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-primary">{t('paymentMethod')}</h3>
                    <button
                      onClick={() => setCurrentStep("payment")}
                      className="text-sm text-primary hover:underline"
                    >
                      {t('edit')}
                    </button>
                  </div>
                  <p className="text-third">
                    {t('cod')}
                  </p>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-primary">{t('orderItems')}</h3>
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-5 p-3 bg-gray-50 rounded-lg">
                        <div className="relative w-16 h-16 shrink-0">
                          <Image
                            src={item.product.image || '/placeholder.svg'}
                            alt={item.product.name_en}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-primary truncate">{item.product.name_en}</p>
                          <p className="text-sm text-third">Qty: {item.quantity}</p>
                          {item.variant && item.variant.attributes && item.variant.attributes.length > 0 && (
                            <p className="text-xs text-third mt-1">
                                {item.variant.attributes.map(a => a.value_en).join(', ')}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold text-primary">
                          {formatPrice(item.product.price * item.quantity, undefined, locale)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-46 flex flex-col gap-5">
            <h2 className="text-xl font-bold text-primary">{t('orderSummary')}</h2>

            {/* Items Preview */}
            <div className="flex flex-col gap-3 pb-5 border-b border-gray-100">
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 shrink-0">
                    <Image
                      src={item.product.image || '/placeholder.svg'}
                      alt={item.product.name_en}
                      fill
                      className="object-cover rounded"
                    />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-secondary text-white text-xs rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{item.product.name_en}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    {formatPrice(item.product.price * item.quantity, undefined, locale)}
                  </p>
                </div>
              ))}
              {items.length > 3 && (
                <p className="text-sm text-third text-center">
                  {t('moreItems', { count: items.length - 3 })}
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="flex flex-col gap-3 pb-5 border-b border-gray-100">
              <div className="flex justify-between text-third">
                <span>{t('subtotalWithCount', { count: totalItems })}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-third">
                <span>{t('shipping')}</span>
                <span className={shipping === 0 ? "text-secondary font-medium" : ""}>
                  {shipping === 0 ? t('free') : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-third">
                <span>{t('tax')}</span>
                <span>{formatPrice(tax)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between text-lg font-bold text-primary">
              <span>{t('total')}</span>
              <span className="text-primary">{formatPrice(finalTotal)}</span>
            </div>

            <div className="flex gap-5">
              {currentStep !== "shipping" && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    if (currentStep === "payment") setCurrentStep("shipping");
                    if (currentStep === "review") setCurrentStep("payment");
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <Button 
                size="lg" 
                className="flex-1" 
                onClick={() => {
                  if (currentStep === "shipping") setCurrentStep("payment");
                  if (currentStep === "payment") setCurrentStep("review");
                  if (currentStep === "review") handlePlaceOrder();
                }}
                isLoading={isProcessing}
              >
                {currentStep === "shipping" && t('continueToPayment')}
                {currentStep === "payment" && t('reviewOrderAction')}
                {currentStep === "review" && t('placeOrder')}
                {currentStep !== "review" && <ChevronRight className="w-5 h-5" />}
                {currentStep === "review" && <Lock className="w-5 h-5" />}
              </Button>
            </div>


            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-third pt-5 border-t border-gray-100">
              <Lock className="w-4 h-4" />
              <span>{t('secureCheckout')}</span>
            </div>

          </Card>
        </div>
      </div>

       {/* Mobile Sticky Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:hidden">
        <AnimatePresence>
          {isMobileSummaryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="border-b border-gray-100 bg-white"
            >
              <div className="p-4 space-y-3">
                 <div className="flex justify-between text-sm text-third">
                  <span>{t('subtotalWithCount', { count: totalItems })}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-third">
                  <span>{t('shipping')}</span>
                  <span className={shipping === 0 ? "text-secondary font-medium" : ""}>
                    {shipping === 0 ? t('free') : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-third">
                  <span>{t('tax')}</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 p-4 bg-white">
           {currentStep !== "shipping" && (
                <Button
                  variant="outline"
                  size="lg"
                  className="px-3"
                  onClick={() => {
                    if (currentStep === "payment") setCurrentStep("shipping");
                    if (currentStep === "review") setCurrentStep("payment");
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
            )}
            
          <div 
            className="flex-1 flex flex-col justify-center cursor-pointer" 
            onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          >
            <div className="flex items-center gap-2 select-none">
              <span className="font-bold text-primary text-xl tracking-tight">{formatPrice(finalTotal)}</span>
              {isMobileSummaryOpen ? (
                <ChevronDown className="w-4 h-4 text-primary" />
              ) : (
                <ChevronUp className="w-4 h-4 text-primary" />
              )}
            </div>
             <span className="text-[10px] text-third">Total</span>
          </div>
          
          <Button 
            size="lg" 
            className="flex-[2] text-sm sm:text-base px-2 sm:px-4" 
            onClick={() => {
              if (currentStep === "shipping") setCurrentStep("payment");
              if (currentStep === "payment") setCurrentStep("review");
              if (currentStep === "review") handlePlaceOrder();
            }}
            isLoading={isProcessing}
          >
             {currentStep === "shipping" && t('continueToPayment')}
            {currentStep === "payment" && t('reviewOrderAction')}
            {currentStep === "review" && t('placeOrder')}
          </Button>
        </div>
      </div>
    </>
  );
}
