"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Badge, Card, Checkbox, Radio } from "@/components/ui";
import { Category, Brand } from "@/types";
import { PRICE_RANGES, RATING_OPTIONS } from "@/lib/constants";

interface ProductFiltersProps {
  categories?: Category[];
  brands?: Brand[];
  selectedCategories?: string[];
  selectedBrands?: string[];
  priceRange?: { min: number; max: number };
  rating?: number;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

export interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number } | null;
  rating: number | null;
}

export function ProductFilters({
  categories = [],
  brands = [],
  selectedCategories = [],
  selectedBrands = [],
  priceRange,
  rating,
  onFilterChange,
  className,
}: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "categories",
    "price",
    "brands",
    "rating",
  ]);

  const [filters, setFilters] = useState<FilterState>({
    categories: selectedCategories,
    brands: selectedBrands,
    priceRange: priceRange || null,
    rating: rating || null,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleCategoryChange = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId];
    
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleBrandChange = (brandId: string) => {
    const newBrands = filters.brands.includes(brandId)
      ? filters.brands.filter((b) => b !== brandId)
      : [...filters.brands, brandId];
    
    const newFilters = { ...filters, brands: newBrands };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (range: { min: number; max: number } | null) => {
    const newFilters = { ...filters, priceRange: range };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (value: number | null) => {
    const newFilters = { ...filters, rating: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters: FilterState = {
      categories: [],
      brands: [],
      priceRange: null,
      rating: null,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    (filters.priceRange ? 1 : 0) +
    (filters.rating ? 1 : 0);

  return (
    <Card className={cn("p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary hover:underline"
          >
            Clear all ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
          {filters.categories.map((catId) => {
            const category = categories.find((c) => c.id === catId);
            return category ? (
              <Badge
                key={catId}
                variant="outline"
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => handleCategoryChange(catId)}
              >
                {category.name}
                <X className="w-3 h-3" />
              </Badge>
            ) : null;
          })}
          {filters.brands.map((brandId) => {
            const brand = brands.find((b) => b.id === brandId);
            return brand ? (
              <Badge
                key={brandId}
                variant="outline"
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => handleBrandChange(brandId)}
              >
                {brand.name}
                <X className="w-3 h-3" />
              </Badge>
            ) : null;
          })}
          {filters.priceRange && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handlePriceChange(null)}
            >
              ${filters.priceRange.min} - ${filters.priceRange.max === Infinity ? "+" : filters.priceRange.max}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {filters.rating && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleRatingChange(null)}
            >
              {filters.rating}+ Stars
              <X className="w-3 h-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Categories Section */}
      <FilterSection
        title="Categories"
        isExpanded={expandedSections.includes("categories")}
        onToggle={() => toggleSection("categories")}
      >
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
            >
              <Checkbox
                checked={filters.categories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
              />
              <span 
                className="text-sm text-gray-700 cursor-pointer flex-1"
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </span>
              {category.productCount && (
                <span className="text-xs text-gray-400">
                  ({category.productCount})
                </span>
              )}
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Price Section */}
      <FilterSection
        title="Price"
        isExpanded={expandedSections.includes("price")}
        onToggle={() => toggleSection("price")}
      >
        <div className="space-y-3">
          {PRICE_RANGES.map((range) => (
            <div
              key={range.label}
              className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
            >
              <Radio
                name="priceRange"
                checked={
                  filters.priceRange?.min === range.min &&
                  filters.priceRange?.max === range.max
                }
                onChange={() => handlePriceChange({ min: range.min, max: range.max })}
              />
              <span 
                className="text-sm text-gray-700 cursor-pointer"
                onClick={() => handlePriceChange({ min: range.min, max: range.max })}
              >
                {range.label}
              </span>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Brands Section */}
      {brands.length > 0 && (
        <FilterSection
          title="Brands"
          isExpanded={expandedSections.includes("brands")}
          onToggle={() => toggleSection("brands")}
        >
          <div className="space-y-3">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
              >
                <Checkbox
                  checked={filters.brands.includes(brand.id)}
                  onChange={() => handleBrandChange(brand.id)}
                />
                <span 
                  className="text-sm text-gray-700 cursor-pointer"
                  onClick={() => handleBrandChange(brand.id)}
                >
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Rating Section */}
      <FilterSection
        title="Rating"
        isExpanded={expandedSections.includes("rating")}
        onToggle={() => toggleSection("rating")}
      >
        <div className="space-y-3">
          {RATING_OPTIONS.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
            >
              <Radio
                name="rating"
                checked={filters.rating === option.value}
                onChange={() => handleRatingChange(option.value)}
              />
              <span 
                className="text-sm text-gray-700 cursor-pointer"
                onClick={() => handleRatingChange(option.value)}
              >
                {option.label}
              </span>
            </div>
          ))}
        </div>
      </FilterSection>
    </Card>
  );
}

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      <div
        className={cn(
          "transition-all duration-300",
          isExpanded ? "max-h-96 mt-3 overflow-visible" : "max-h-0 overflow-hidden"
        )}
      >
        <div className="px-1 py-1">
          {children}
        </div>
      </div>
    </div>
  );
}
