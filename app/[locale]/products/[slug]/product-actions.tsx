"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components";
import { QuantitySelector } from "@/components/ui/quantity-selector";

interface Product {
  id: string | number;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = (count: number) => {
    // In a real app, you would use the 'quantity' state here
    // But AddToCartButton might handle the click.
    // If AddToCartButton calls this with a count, we can ignore it and use our state,
    // or we can pass the quantity to AddToCartButton if it supported it.
    // For now, let's assume we want to add 'quantity' items.
    console.log(`Adding ${quantity} items of product ${product.id} to cart`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
      <div className="shrink-0">
        <QuantitySelector 
          value={quantity} 
          onChange={setQuantity} 
          max={product.stock > 0 ? product.stock : 1}
        />
      </div>
      <div className="flex-1">
        <AddToCartButton 
          product={product} 
          color="bg-primary" 
          onAddToCart={() => handleAddToCart(quantity)}
        />
      </div>
    </div>
  );
}
