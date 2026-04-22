"use client";

import { ProductAttribute } from "@/types";
import { cn } from "@/lib/utils";
import { ProductOptionChip } from "@/components/products/product-option-chip";

interface ProductOptionsProps {
  attributes: ProductAttribute[];
  selectedOptions: Record<string, string>;
  onChange: (attributeName: string, value: string) => void;
  isOptionDisabled?: (attributeName: string, value: string) => boolean;
}

export function ProductOptions({ attributes, selectedOptions, onChange, isOptionDisabled }: ProductOptionsProps) {
  if (!attributes || attributes.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {attributes.map((attribute) => (
        <div key={attribute.id} className="flex flex-col gap-3">
          <h3 className="font-semibold text-primary text-sm">
            {attribute.name}: <span className="font-normal text-third">{selectedOptions[attribute.name]}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {attribute.values.map((item) => {
              const isSelected = selectedOptions[attribute.name] === item.value;
              // Selected options should never be disabled
              const isDisabled = isSelected ? false : (isOptionDisabled ? isOptionDisabled(attribute.name, item.value) : false);

              return (
                <ProductOptionChip
                  key={item.value}
                  label={item.value}
                  selected={isSelected}
                  disabled={isDisabled}
                  color={attribute.isColor ? item.meta : undefined}
                  title={item.value}
                  onClick={() => onChange(attribute.name, item.value)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
