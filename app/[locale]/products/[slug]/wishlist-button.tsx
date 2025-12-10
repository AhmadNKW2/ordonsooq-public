"use client";

import { Heart } from "lucide-react";
import { Button, IconButton } from "@/components/ui";
import { useWishlist } from "@/hooks/use-wishlist";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  product: Product;
  variant?: "default" | "icon";
}

export function WishlistButton({ product, variant = "default" }: WishlistButtonProps) {
  const { toggleItem, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  if (variant === "icon") {
    return (
      <IconButton
        onClick={() => toggleItem(product)}
        variant={inWishlist ? "filled" : "default"}
        color={inWishlist ? "var(--color-danger)" : "var(--color-gray-700)"}
        className={cn(
          "shadow-lg hover:scale-110",
          !inWishlist && "bg-white/90 backdrop-blur-sm hover:bg-danger hover:text-white"
        )}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={cn(inWishlist && "fill-current")} />
      </IconButton>
    );
  }

  return (
    <Button
      color="white"
      size="lg"
      onClick={() => toggleItem(product)}
      className={cn(
        "transition-all duration-300",
        inWishlist && "border-danger text-danger hover:bg-danger/10"
      )}
    >
      <Heart className={cn("w-5 h-5", inWishlist && "fill-danger")} />
      {inWishlist ? "Saved" : "Wishlist"}
    </Button>
  );
}
