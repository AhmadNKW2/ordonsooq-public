"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { AddToCartButton } from "@/components";
import { Button } from "@/components/ui";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { useCart } from "@/hooks/use-cart";
import { Product } from "@/types";

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCart();
  const router = useRouter();

  const handleAddToCart = (count: number) => {
    // AddToCartButton passes 1 by default, but we want to use the selected quantity
    // We can ignore the count passed by the button and use our state
    addItem(product, quantity);
  };

  const handleCheckout = () => {
    addItem(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-5 pt-4 w-full">
      <div className="shrink-0">
        <QuantitySelector 
          value={quantity} 
          onChange={setQuantity} 
          max={product.stock > 0 ? product.stock : 1}
        />
      </div>
      <div className="flex-1 flex gap-5">
        <div className="flex-1">
          <AddToCartButton 
            product={product} 
            color="bg-primary" 
            onAddToCart={() => handleAddToCart(quantity)}
            onAnimationEnd={openCart}
          />
        </div>
        <div className="flex-1">
          <Button 
            variant="pill" 
            className="w-full h-11 font-bold shadow-s1 bg-secondary hover:bg-secondary/90 text-white"
            onClick={handleCheckout}
            disabled={product.stock === 0}
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
