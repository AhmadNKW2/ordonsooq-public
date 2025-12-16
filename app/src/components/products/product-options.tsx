"use client";

import { useState } from "react";
import { Radio } from "@/components/ui/radio";

interface Variant {
  id: string;
  name: string;
}

interface ProductOptionsProps {
  variants: Variant[];
}

export function ProductOptions({ variants }: ProductOptionsProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id);

  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-primary">Options</h3>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <Radio
            key={variant.id}
            variant="tag"
            name="product-variant"
            value={variant.id}
            label={variant.name}
            checked={selectedVariantId === variant.id}
            onChange={() => setSelectedVariantId(variant.id)}
          />
        ))}
      </div>
    </div>
  );
}
