"use client";

import { ProductAttribute } from "@/types";
import { cn } from "@/lib/utils";
import { Radio } from "@/components/ui/radio";

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
              
              if (attribute.isColor && item.meta) {
                return (
                  <button
                    key={item.value}
                    onClick={() => !isDisabled && onChange(attribute.name, item.value)}
                    disabled={isDisabled}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 ring-2 transition-all relative",
                      isSelected ? "border-white! ring-secondary scale-101" : "border-transparent ring-transparent hover:border-white/50 hover:ring-secondary/50 hover:scale-101",
                      isDisabled && "opacity-50 cursor-not-allowed hover:scale-100"
                    )}
                    style={{ backgroundColor: item.meta }}
                    title={item.value}
                    aria-label={item.value}
                  >
                  </button>
                );
              }

              return (
                <Radio
                  key={item.value}
                  variant="tag"
                  name={`attribute-${attribute.id}`}
                  value={item.value}
                  label={item.value}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => onChange(attribute.name, item.value)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
