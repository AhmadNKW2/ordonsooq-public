"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button, Badge, Card, Checkbox, Radio, Input } from "@/components/ui";
import { PRICE_RANGES, RATING_OPTIONS } from "@/lib/constants";
import { FacetCount } from "@/lib/search/types";

interface ProductFiltersProps {
  facets?: FacetCount[];
  selectedCategories?: string[];
  selectedBrands?: string[];
  selectedVendors?: string[];
  selectedAttrs?: string[];
  priceRange?: { min: number; max: number };
  rating?: number;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

export interface FilterState {
  categories: string[];
  brands: string[];
  vendors: string[];
  attrs: string[];
  priceRange: { min: number; max: number } | null;
  rating: number | null;
}

export function ProductFilters({
  facets = [],
  selectedCategories = [],
  selectedBrands = [],
  selectedVendors = [],
  selectedAttrs = [],
  priceRange,
  rating,
  onFilterChange,
  className,
}: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "categories",
    "price",
    "brands",
    "vendors",
    "attributes",
    "rating",
  ]);

  const [filters, setFilters] = useState<FilterState>({
    categories: selectedCategories,
    brands: selectedBrands,
    vendors: selectedVendors,
    attrs: selectedAttrs,
    priceRange: priceRange || null,
    rating: rating || null,
  });

  const [localMinPrice, setLocalMinPrice] = useState<string>(priceRange?.min?.toString() || '');
  const [localMaxPrice, setLocalMaxPrice] = useState<string>((priceRange?.max === Infinity || !priceRange?.max) ? '' : priceRange.max.toString());

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

  const handleVendorChange = (vendorId: string) => {
    const newVendors = filters.vendors.includes(vendorId)
      ? filters.vendors.filter((v) => v !== vendorId)
      : [...filters.vendors, vendorId];

    const newFilters = { ...filters, vendors: newVendors };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAttrChange = (attrVal: string) => {
    const newAttrs = filters.attrs.includes(attrVal)
      ? filters.attrs.filter((a) => a !== attrVal)
      : [...filters.attrs, attrVal];

    const newFilters = { ...filters, attrs: newAttrs };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (range: { min: number; max: number } | null) => {
    const newFilters = { ...filters, priceRange: range };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (newRating: number | null) => {
    const newFilters = { ...filters, rating: newRating };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters: FilterState = {
      categories: [],
      brands: [],
      vendors: [],
      attrs: [],
      priceRange: null,
      rating: null,
    };
    setFilters(newFilters);
    setLocalMinPrice('');
    setLocalMaxPrice('');
    onFilterChange(newFilters);
  };

  const t = useTranslations();
  const locale = useLocale();

  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    filters.vendors.length +
    filters.attrs.length +
    (filters.priceRange ? 1 : 0) +
    (filters.rating ? 1 : 0);

  // Parse generic facets
  const categoryFacet = facets.find(f => f.field_name === 'category' || f.field_name === 'category_id' || f.field_name === 'category_ids' || f.field_name === 'categories.name_en');
  const brandFacet = facets.find(f => f.field_name === 'brand' || f.field_name === 'brand_id');
  const vendorFacet = facets.find(f => f.field_name === 'vendor_id' || f.field_name === 'vendor');
  const attrsFacet = facets.find(f => f.field_name === 'attr_pairs' || f.field_name === 'attributes');

  const groupedAttrs = useMemo(() => {
    if (!attrsFacet) return {};
    
    // key is the English name (which is usually index 0), to keep it stable
    const groups: Record<string, { title: string; items: { val: string; display: string; count: number; original: string }[] }> = {};
    
    attrsFacet.counts.forEach(attrCount => {
      const parts = attrCount.value.split(':');
      let nameEn = parts[0];
      let valEn = parts[1] || '';
      
      let title = nameEn;
      let display = valEn;

      if (parts.length === 4) {
          // Format expected: NameEn:NameAr:ValueEn:ValueAr
          title = locale === 'ar' ? (parts[1] || parts[0]) : parts[0];
          display = locale === 'ar' ? (parts[3] || parts[2]) : parts[2];
          nameEn = parts[0]; // use english name for grouping key
      } else if (parts.length === 2 && parts[0].includes('|')) {
          const nameParts = parts[0].split('|');
          const valParts = parts[1].split('|');
          title = locale === 'ar' && nameParts.length > 1 ? nameParts[1] : nameParts[0];
          display = locale === 'ar' && valParts.length > 1 ? valParts[1] : valParts[0];
          nameEn = nameParts[0];
      }

      const key = nameEn;
      
      if (!groups[key]) {
         groups[key] = { title, items: [] };
      }
      
      groups[key].items.push({
         val: valEn,
         display: display,
         count: attrCount.count,
         original: attrCount.value
      });
    });
    
    return groups;
  }, [attrsFacet, locale]);

  return (
    <Card className={cn("p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary">{t('common.filters')}</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary hover:underline"
          >
            {t('common.clearAll', { count: activeFiltersCount })}
          </button>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100 mt-4">
          {filters.categories.map((catValue) => (
            <Badge
              key={catValue}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleCategoryChange(catValue)}
            >
              {catValue}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {filters.brands.map((brandVal) => (
            <Badge
              key={brandVal}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleBrandChange(brandVal)}
            >
              {brandVal}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {filters.vendors.map((vendorVal) => (
            <Badge
              key={vendorVal}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleVendorChange(vendorVal)}
            >
              {t('common.store')} {vendorVal}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {filters.attrs.map((attrVal) => {
             // Try to find grouped value for nice display in badge
             let display = attrVal.replace(':', ': ');
             for (const group of Object.values(groupedAttrs)) {
                 const match = group.items.find(i => i.original === attrVal);
                 if (match) { display = match.display; break; }
             }
             return (
               <Badge
                 key={attrVal}
                 variant="outline"
                 className="flex items-center gap-1 cursor-pointer"
                 onClick={() => handleAttrChange(attrVal)}
               >
                 {display}
                 <X className="w-3 h-3" />
               </Badge>
             )
          })}
          {filters.priceRange && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => {
                setLocalMinPrice('');
                setLocalMaxPrice('');
                handlePriceChange(null);
              }}
            >
              {filters.priceRange.min} - {filters.priceRange.max === Infinity ? "+" : filters.priceRange.max} {t('common.currency')}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {filters.rating && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleRatingChange(null)}
            >
              {filters.rating}+ {t('common.stars')}
              <X className="w-3 h-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Categories Section */}
      {categoryFacet && categoryFacet.counts.length > 0 && (
        <FilterSection
          title={t('common.categories')}
          isExpanded={expandedSections.includes("categories")}
          onToggle={() => toggleSection("categories")}
        >
          <div className="flex flex-col gap-3">
            {categoryFacet.counts.map((catCount) => (
              <div
                key={catCount.value}
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleCategoryChange(catCount.value)}
              >
                <Checkbox
                  id={`cat-${catCount.value}`}
                  checked={filters.categories.includes(catCount.value)}
                  onChange={() => handleCategoryChange(catCount.value)}
                />
                <span className="text-sm text-primary cursor-pointer flex-1">
                  {catCount.value}
                </span>
                <span className="text-xs text-third">
                  ({catCount.count})
                </span>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Attributes dynamically grouped by original attribute name */}
      {Object.entries(groupedAttrs).map(([key, group]) => (
        <FilterSection
          key={key}
          title={group.title}
          isExpanded={!expandedSections.includes(`attr-collapse-${key}`)}
          onToggle={() => toggleSection(`attr-collapse-${key}`)}
        >
          <div className="flex flex-col gap-3">
            {group.items.map((item) => (
              <div
                key={item.original}
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleAttrChange(item.original)}
              >
                <Checkbox
                  id={`attr-${item.original}`}
                  checked={filters.attrs.includes(item.original)}
                  onChange={() => handleAttrChange(item.original)}
                />
                <span className="text-sm text-primary cursor-pointer flex-1">
                  {item.display}
                </span>
                <span className="text-xs text-third">
                  ({item.count})
                </span>
              </div>
            ))}
          </div>
        </FilterSection>
      ))}

      {/* Vendors Section */}
      {vendorFacet && vendorFacet.counts.length > 0 && (
        <FilterSection
          title={t('nav.stores') || 'Vendors'}
          isExpanded={expandedSections.includes("vendors")}
          onToggle={() => toggleSection("vendors")}
        >
          <div className="flex flex-col gap-3">
            {vendorFacet.counts.map((vendorCount) => (
              <div
                key={vendorCount.value}
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleVendorChange(vendorCount.value)}
              >
                <Checkbox
                  id={`vendor-${vendorCount.value}`}
                  checked={filters.vendors.includes(vendorCount.value)}
                  onChange={() => handleVendorChange(vendorCount.value)}
                />
                <span className="text-sm text-primary cursor-pointer flex-1">
                  {t('common.store')} {vendorCount.value}
                </span>
                <span className="text-xs text-third">
                  ({vendorCount.count})
                </span>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Section */}
      <FilterSection
        title={t('common.price')}
        isExpanded={expandedSections.includes("price")}
        onToggle={() => toggleSection("price")}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              placeholder={t('common.min') || 'Min'}
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="w-full text-sm h-9"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              min="0"
              placeholder={t('common.max') || 'Max'}
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="w-full text-sm h-9"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => {
              const minStr = localMinPrice;
              const maxStr = localMaxPrice;
              
              if (!minStr && !maxStr) {
                 handlePriceChange(null);
                 return;
              }

              const min = minStr ? parseInt(minStr) : 0;
              const max = maxStr ? parseInt(maxStr) : Infinity;

              if (!isNaN(min) && !isNaN(max)) {
                 handlePriceChange({ min, max });
              }
            }}
          >
            {t('common.apply') || 'Apply'}
          </Button>
        </div>
      </FilterSection>

      {/* Brands Section */}
      {brandFacet && brandFacet.counts.length > 0 && (
        <FilterSection
          title={t('common.brands')}
          isExpanded={expandedSections.includes("brands")}
          onToggle={() => toggleSection("brands")}
        >
          <div className="flex flex-col gap-3">
            {brandFacet.counts.map((brandCount) => (
              <div
                key={brandCount.value}
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleBrandChange(brandCount.value)}
              >
                <Checkbox
                  id={`brand-${brandCount.value}`}
                  checked={filters.brands.includes(brandCount.value)}
                  onChange={() => handleBrandChange(brandCount.value)}
                />
                <span className="text-sm text-primary cursor-pointer flex-1">
                  {brandCount.value}
                </span>
                <span className="text-xs text-third">
                  ({brandCount.count})
                </span>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Rating Section */}
      <FilterSection
        title={t('common.rating')}
        isExpanded={expandedSections.includes("rating")}
        onToggle={() => toggleSection("rating")}
      >
        <div className="flex flex-col gap-3">
          {RATING_OPTIONS.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleRatingChange(option.value)}
            >
              <Radio
                id={`rating-${option.value}`}
                name="rating"
                checked={filters.rating === option.value}
                onChange={() => handleRatingChange(option.value)}
              />
              <span className="text-sm text-primary cursor-pointer">
                {t(option.label)}
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
        <span className="font-medium text-primary">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-third" />
        ) : (
          <ChevronDown className="w-4 h-4 text-third" />
        )}
      </button>
      <div
        className={cn(
          "transition-all duration-300",
          isExpanded ? "max-h-[800px] mt-4 opacity-100" : "max-h-0 opacity-0 hidden"
        )}
      >
        {children}
      </div>
    </div>
  );
}
