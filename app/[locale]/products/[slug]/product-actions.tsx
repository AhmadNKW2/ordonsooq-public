"use client";

import { useRouter } from "@/i18n/navigation";
import { AddToCartButton } from "@/components";
import { Button } from "@/components/ui";
import { useCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/useCheckout";
import { Product, ProductVariant } from "@/types";
import { SITE_CONFIG } from "@/lib/constants";
import { useTranslations } from "next-intl";

interface ProductActionsProps {
  product: Product;
  selectedVariant?: ProductVariant;
}

export function ProductActions({ product, selectedVariant }: ProductActionsProps) {
  const { addItem, openCart } = useCart();
  const router = useRouter();
  const t = useTranslations();
  const { handleCheckout: proceedToCheckout } = useCheckout();

  const handleCheckout = () => {
    addItem(product, 1, selectedVariant?.id, {
      openSidebar: false,
      onSuccess: () => {
        proceedToCheckout();
      }
    });
  };

  const maxStock = selectedVariant ? selectedVariant.stock : product.stock;
  
  // Format phone number for WhatsApp: remove non-digits, ensuring it starts with dial code
  const waNumber = SITE_CONFIG.contact.phone.replace(/\D/g, "");
  const waMessage = encodeURIComponent(`Hello, I have an inquiry about the product: ${product.name}`);

  return (
    <div className="flex-1 flex flex-col gap-3">
      <AddToCartButton
        product={product}
        variant={selectedVariant}
        color="bg-primary"
        onAnimationEnd={openCart}
        disabled={maxStock === 0}
      />
      <Button
        variant="pill"
        className="w-full h-11 font-bold shadow-s1 bg-secondary hover:bg-secondary/90 text-white"
        onClick={handleCheckout}
        disabled={product.stock === 0}
      >
        {t("product.buyNow")}
      </Button>

      <div className="mt-1 bg-green-50/80 rounded-2xl p-3.5 border border-green-100 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-green-800 leading-tight">
            {t("product.inquiries")}
          </span>
        </div>
        <a 
          href={`https://wa.me/${waNumber}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] hover:scale-105 transition-all text-white px-3.5 py-2 rounded-full text-xs font-bold shadow-sm"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 448 512">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
          {t("product.whatsappUs")}
        </a>
      </div>
    </div>
  );
}
