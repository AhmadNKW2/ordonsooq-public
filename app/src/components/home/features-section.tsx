"use client";

import { Truck, RotateCcw, Shield, Headphones, Clock, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";

export function FeaturesSection() {
  const t = useTranslations('features');

  const features = [
    {
      icon: Truck,
      title: t('freeShipping'),
      description: t('freeShippingDesc'),
    },
    {
      icon: RotateCcw,
      title: t('easyReturns'),
      description: t('easyReturnsDesc'),
    },
    {
      icon: Shield,
      title: t('secureCheckout'),
      description: t('secureCheckoutDesc'),
    },
    {
      icon: Headphones,
      title: t('support'),
      description: t('supportDesc'),
    },
    {
      icon: Clock,
      title: t('fastDelivery'),
      description: t('fastDeliveryDesc'),
    },
    {
      icon: CreditCard,
      title: t('flexiblePayment'),
      description: t('flexiblePaymentDesc'),
    },
  ];

  return (
    <section className="bg-gray-50 rounded-r1">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col gap-1 items-center text-center p-4 hover:bg-white hover:shadow-s1 rounded-xl transition-all duration-300"
            >
              <div className="p-3 bg-primary/5 rounded-full">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-primary">{feature.title}</h3>
              <p className="text-sm text-third">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
