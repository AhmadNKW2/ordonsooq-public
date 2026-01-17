"use client";

import { useRouter } from "@/i18n/navigation";
import { AddToCartButton } from "@/components";
import { Button } from "@/components/ui";
import { useCart } from "@/hooks/use-cart";
import { Product, ProductVariant } from "@/types";

interface ProductActionsProps {
  product: Product;
  selectedVariant?: ProductVariant;
}

export function ProductActions({ product, selectedVariant }: ProductActionsProps) {
  const { addItem, openCart } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    addItem(product, 1, selectedVariant?.id, {
      openSidebar: false,
      onSuccess: () => {
        router.push("/checkout");
      }
    });
  };

  const maxStock = selectedVariant ? selectedVariant.stock : product.stock;

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
        Buy Now
      </Button>
    </div>
  );
}
