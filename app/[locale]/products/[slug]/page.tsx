"use client";

import { useState, useEffect, useMemo } from "react";
import { notFound, useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Star, Truck, Shield, RotateCcw, Store, ChevronRight } from "lucide-react";
import { useProduct, useProductsByCategory, useListingVariantProducts } from "@/hooks";
import { useWishlist } from "@/hooks/use-wishlist";
import { transformProduct, type Locale } from "@/lib/transformers";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import { ProductGallery, ProductsSection, ProductOptions, ProductReviews } from "@/components";
import { Badge, Card, IconButton, Breadcrumb } from "@/components/ui";
import { ProductActions } from "./product-actions";

export default function ProductPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const { toggleItem, isInWishlist, isItemLoading } = useWishlist();

  const requestedVariantId = useMemo(() => {
    const raw = searchParams.get("variant") ?? searchParams.get("variantId");
    const id = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(id) ? String(id) : undefined;
  }, [searchParams]);

  // Extract product ID from slug (format: product-name-ID)
  const productId = parseInt(slug.split('-').pop() || '0', 10);

  const { data: productData, isLoading, error } = useProduct(productId);

  // Fetch related products by category
  const categoryId = productData?.category?.id;
  const { data: relatedData } = useProductsByCategory(
    categoryId || 0,
    { limit: 4, status: 'active' }
  );

  // Transform product data safely
  const product = useMemo(() => {
    if (!productData) return null;
    return transformProduct(productData, locale);
  }, [productData, locale]);

  // Related products (must be a hook call before any early return)
  const { products: relatedProductsRaw } = useListingVariantProducts(relatedData?.data, locale);
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return relatedProductsRaw.filter((p) => p.id !== product.id).slice(0, 4);
  }, [relatedProductsRaw, product]);

  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize options (prefer variant from URL when provided)
  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) return;
    if (hasInitialized) return;

    // If a variant is specified in the URL (e.g., coming from cart), use it
    if (requestedVariantId) {
      const match = product.variants.find(v => String(v.id) === requestedVariantId);
      if (match && Object.keys(match.attributes).length > 0) {
        setSelectedOptions(match.attributes);
        setHasInitialized(true);
        return;
      }
    }

    // 1. Try to find the first variant with stock > 0
    let defaultVariant = product.variants.find(v => v.stock > 0);

    // 2. If no stock, just take the first variant
    if (!defaultVariant) {
      defaultVariant = product.variants[0];
    }

    if (defaultVariant && Object.keys(defaultVariant.attributes).length > 0) {
      setSelectedOptions(defaultVariant.attributes);
    }
    setHasInitialized(true);
  }, [product?.variants, requestedVariantId, hasInitialized]);

  // Find matching variant
  const selectedVariant = useMemo(() => {
    if (!product?.variants) return undefined;
    return product.variants.find(v => {
      return Object.entries(selectedOptions).every(([key, value]) => v.attributes[key] === value);
    });
  }, [product?.variants, selectedOptions]);

  const selectedOptionsSummary = useMemo(() => {
    if (!product?.attributes || product.attributes.length === 0) return "";

    const parts = product.attributes
      .map((attr) => {
        const value = selectedOptions[attr.name];
        return value ? `${attr.name}: ${value}` : null;
      })
      .filter(Boolean) as string[];

    return parts.join(" • ");
  }, [product?.attributes, selectedOptions]);

  // Determine which image index to show
  const selectedImageIndex = useMemo(() => {
    if (!product || !product.attributes) return 0;

    // Find attribute that controls media
    const mediaAttribute = product.attributes.find(a => a.controlsMedia);
    if (!mediaAttribute) return 0;

    // Get selected value for that attribute
    const selectedValue = selectedOptions[mediaAttribute.name];
    if (!selectedValue) return 0;

    // Find the image url for this value
    const attributeValue = mediaAttribute.values.find(v => v.value === selectedValue);

    if (attributeValue?.image) {
      const index = product.images.indexOf(attributeValue.image);
      return index >= 0 ? index : 0;
    }

    return 0;
  }, [product, selectedOptions]);

  // Sync internal gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  useEffect(() => {
    setActiveImageIndex(selectedImageIndex);
  }, [selectedImageIndex]);


  const handleOptionChange = (attributeName: string, value: string) => {
    if (!product?.variants) {
      setSelectedOptions(prev => ({ ...prev, [attributeName]: value }));
      return;
    }

    const newOptions = { ...selectedOptions, [attributeName]: value };

    // Check if the new combination is valid and in stock
    const exactMatch = product.variants.find(v =>
      Object.entries(newOptions).every(([key, val]) => v.attributes[key] === val)
    );

    if (exactMatch && exactMatch.stock > 0) {
      setSelectedOptions(newOptions);
      return;
    }

    // Logic to find the best matching variant when exact match is not available
    // We look for any variant that has the selected attribute value and is in stock
    const candidates = product.variants.filter(v => 
      v.attributes[attributeName] === value && v.stock > 0
    );

    if (candidates.length > 0) {
      // Find the candidate that is "closest" to the current selection
      // We calculate a score based on how many OTHER attributes match the current selection
      const bestMatch = candidates.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        Object.entries(selectedOptions).forEach(([key, val]) => {
          if (key === attributeName) return; // Skip the attribute we just changed
          
          if (a.attributes[key] === val) scoreA++;
          if (b.attributes[key] === val) scoreB++;
        });

        return scoreB - scoreA; // Descending sort (higher score first)
      })[0];

      // Use the attributes of the best matching variant
      setSelectedOptions(bestMatch.attributes);
      return;
    }

    // Fallback: If no valid variant found even with other attribute changes, 
    // just set the option (user will see it as unavailable)
    setSelectedOptions(newOptions);
  };

  // Check if an option should be disabled
  const isOptionDisabled = (attributeName: string, value: string) => {
    if (!product?.variants) return false;

    // Check if this option value exists in ANY variant that is in stock
    const hasAnyInStockVariant = product.variants.some(v =>
      v.attributes[attributeName] === value && v.stock > 0
    );

    return !hasAnyInStockVariant;
  };

  if (isLoading) {
    return (
      <div className="px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2" />
            <div className="h-10 bg-gray-200 animate-pulse rounded w-1/3" />
            <div className="h-24 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="lg:col-span-3">
            <div className="h-48 bg-gray-200 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    notFound();
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentCompareAtPrice = selectedVariant && selectedVariant.compareAtPrice ? selectedVariant.compareAtPrice : product.compareAtPrice;
  // Fallback to product dimensions if selected variant has none, but prioritize variant's if present
  const currentDimensions = selectedVariant?.dimensions || product.dimensions;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSku = product.sku;

  const discount = currentCompareAtPrice
    ? calculateDiscount(currentCompareAtPrice, currentPrice)
    : 0;

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.products'), href: "/products" },
          { label: product.category.name, href: `/categories/${product.category.slug}` },
          { label: product.name }
        ]}
      />

      {/* Product Details - Mobile Layout (Brand -> Name -> Rating -> Wishlist -> Main Image -> Thumbnails -> Price) */}
      <div className="lg:hidden flex flex-col gap-4 mb-8">
        {/* Header Info */}
        <div className="flex flex-col gap-2">
          {product.brand && (
            <div className="flex items-center gap-2">
              {product.brand.logo && (
                <Image
                  src={product.brand.logo}
                  alt={product.brand.name}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              )}
              <p className="text-sm text-primary font-medium">{product.brand.name}</p>
            </div>
          )}

          <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl font-bold text-primary flex-1">
              {product.name}
              {selectedOptionsSummary ? (
                <span className="font-medium text-third text-sm">
                  {" "}({selectedOptionsSummary})
                </span>
              ) : null}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <Star size={16} className="fill-secondary text-secondary mb-1" />
            <span className="text-sm font-bold text-primary">{product.rating || 0}</span>
            {
              product.reviewCount > 0 &&
              <span className="text-sm text-gray-500">
                ({product.reviewCount || 0})
              </span>
            }
          </div>
        </div>

        {/* Gallery (Main Image -> Thumbnails) */}
        <ProductGallery
          images={product.images}
          productName={product.name}
          initialIndex={selectedImageIndex}
          selectedIndex={activeImageIndex}
          onIndexChange={setActiveImageIndex}
          showThumbnails={true}
          showMainImage={true}
          wishlistButton={
            <IconButton
              onClick={() => toggleItem(product, selectedVariant ? parseInt(selectedVariant.id, 10) : null)}
              isActive={isInWishlist(product.id, selectedVariant ? parseInt(selectedVariant.id, 10) : null)}
              isLoading={isItemLoading(product.id, selectedVariant ? parseInt(selectedVariant.id, 10) : null)}
              className={cn(
                "shadow-sm shrink-0",
                !isInWishlist(product.id, selectedVariant ? parseInt(selectedVariant.id, 10) : null) && "bg-white/80 backdrop-blur-sm"
              )}
              aria-label={
                isInWishlist(product.id, selectedVariant ? parseInt(selectedVariant.id, 10) : null)
                  ? t('product.removeFromWishlist')
                  : t('product.addToWishlist')
              }
              icon="heart"
              shape="circle"
              variant="wishlist"
            />
          }
        />

        {/* Price & Actions */}
        <div className="flex flex-col gap-5 mt-2">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-2xl font-bold text-primary">
              {formatPrice(currentPrice, "JOD", locale)}
            </p>
            {currentCompareAtPrice && currentCompareAtPrice > currentPrice && (
              <>
                <p className="text-lg text-gray-400 line-through">
                  {formatPrice(currentCompareAtPrice, "JOD", locale)}
                </p>
                <Badge variant="sale">
                  {t('product.save', { amount: formatPrice(currentCompareAtPrice - currentPrice, "JOD", locale) })}
                </Badge>
              </>
            )}
          </div>

          <ProductOptions
            attributes={product.attributes || []}
            selectedOptions={selectedOptions}
            onChange={handleOptionChange}
            isOptionDisabled={isOptionDisabled}
          />

          <ProductActions product={product} selectedVariant={selectedVariant} />
        </div>
      </div>

      {/* Product Details - 3 Column Layout */}
      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-8 mb-16">
        {/* Gallery - Column 1 */}
        <div className="lg:col-span-5">
          <ProductGallery
            images={product.images}
            productName={product.name}
            initialIndex={selectedImageIndex}
            selectedIndex={activeImageIndex}
            onIndexChange={setActiveImageIndex}
            showThumbnails={true}
            showMainImage={true}
            wishlistButton={
              <IconButton
                onClick={() => toggleItem(product, selectedVariant ? parseInt(selectedVariant.id, 10) : null)}
                isActive={isInWishlist(product.id, selectedVariant ? parseInt(selectedVariant.id, 10) : null)}
                isLoading={isItemLoading(product.id, selectedVariant ? parseInt(selectedVariant.id, 10) : null)}
                className={cn(
                  "shadow-lg hover:scale-110",
                  !isInWishlist(product.id, selectedVariant ? parseInt(selectedVariant.id, 10) : null) && "bg-white/90 backdrop-blur-sm"
                )}
                aria-label={
                  isInWishlist(product.id, selectedVariant ? parseInt(selectedVariant.id, 10) : null)
                    ? t('product.removeFromWishlist')
                    : t('product.addToWishlist')
                }
                icon="heart"
                shape="circle"
                variant="wishlist"
              />
            }
          />
        </div>

        {/* Info - Column 2 */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Badges */}
          <div className="flex items-center gap-2">
            {product.isNew && <Badge variant="new">{t('product.new')}</Badge>}
            {discount > 0 && <Badge variant="sale">{t('product.off', { percent: discount })}</Badge>}
            {currentStock <= 5 && currentStock > 0 && (
              <Badge variant="warning">{t('product.onlyLeft', { count: currentStock })}</Badge>
            )}
          </div>

          {/* Title & Brand */}
          <div>
            {product.brand && (
              <div className="flex items-center gap-2 mb-2">
                {product.brand.logo && (
                  <Image
                    src={product.brand.logo}
                    alt={product.brand.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                )}
                <p className="text-sm text-primary font-medium">{product.brand.name}</p>
              </div>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              {product.name}
              {selectedOptionsSummary ? (
                <span className="font-medium text-third text-sm md:text-base">
                  {" "}({selectedOptionsSummary})
                </span>
              ) : null}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <Star size={20} className="fill-secondary text-secondary mb-1" />
            <span className="text-base font-bold text-primary">{product.rating || 0}</span>
            <span className="text-sm text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(currentPrice)}
            </span>
            {currentCompareAtPrice && (
              <span className="text-xl text-third opacity-70 line-through">
                {formatPrice(currentCompareAtPrice)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-third leading-relaxed">
            {product.description}
          </p>

          {/* Variants */}
          {product.attributes && product.attributes.length > 0 && (
            <ProductOptions
              attributes={product.attributes}
              selectedOptions={selectedOptions}
              onChange={handleOptionChange}
              isOptionDisabled={isOptionDisabled}
            />
          )}

        </div>

        {/* Vendor Info - Column 3 */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Vendor Card */}
          <Card className="p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {product.vendor?.logo ? (
                  <Image
                    src={product.vendor.logo}
                    alt={product.vendor.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Store className="w-6 h-6 text-third" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-third">{t('product.soldBy')}</p>
                  <a
                    href={`/vendors/${product.vendor?.slug || 'ordonsooq'}`}
                    className="font-semibold text-primary hover:text-secondary hover:translate-x-1.5 transition-all flex items-center gap-1"
                  >
                    {product.vendor?.name || "OrdonSooq"}
                    <ChevronRight className="w-4 h-4" />
                  </a>
                  {product.vendor && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-secondary text-secondary" />
                      <span className="text-xs text-third">
                        {product.vendor.rating} {t('product.reviewCount', { count: product.vendor.reviewCount })}
                      </span>
                      {(() => {
                        const positivePercent = Math.round((product.vendor.rating / 5) * 100);
                        if (!(positivePercent > 75)) return null;
                        return (
                          <span className="text-green-600 font-medium text-xs ml-1">
                            {t('product.positiveFeedback', { percent: positivePercent })}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Other Sellers */}
          {product.otherSellers && product.otherSellers.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-primary">
                {t('product.otherSellers', { count: product.otherSellers.length })}
              </h3>
              <div className="flex flex-col gap-3">
                {product.otherSellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-primary text-sm">{seller.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-secondary text-secondary" />
                        <span className="text-xs text-third">{seller.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatPrice(seller.price)}</p>
                      <button className="text-xs text-primary hover:underline">
                        {t('product.viewOffer')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* SKU & Tags */}
          <Card className="p-4">
            <div className="text-sm text-third flex flex-col gap-2">
              <p>{t('product.sku')}: <span className="text-primary">{currentSku}</span></p>
              <p>{t('product.category')}: <a href={`/categories/${product.category.slug}`} className="text-primary hover:underline">{product.category.name}</a></p>
              {product.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span>{t('product.tags')}:</span>
                  {product.tags.map((tag) => (
                    <a
                      key={tag}
                      href={`/products?tag=${tag}`}
                      className="text-primary hover:underline"
                    >
                      {tag}
                    </a>
                  ))}
                </div>
              )}
              <p>{t('product.brand')}: <a href={`/brands/${product.brand?.slug}`} className="text-primary hover:underline">{product.brand?.name}</a></p>

            </div>
          </Card>

          {/* Actions */}
          <ProductActions product={product} selectedVariant={selectedVariant} />


        </div>


      </div>


      {/* Features */}
      <div className="grid grid-cols-3 gap-5 pt-6 border-t border-gray-100">
        <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
          <Truck className="w-6 h-6 text-primary" />
          <span className="text-sm font-medium">{t('product.features.freeShipping')}</span>
          <span className="text-xs text-third">{t('product.features.freeShippingDesc')}</span>
        </div>
        <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
          <RotateCcw className="w-6 h-6 text-primary" />
          <span className="text-sm font-medium">{t('product.features.returns')}</span>
          <span className="text-xs text-third">{t('product.features.returnsDesc')}</span>
        </div>
        <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-sm font-medium">{t('product.features.secure')}</span>
          <span className="text-xs text-third">{t('product.features.secureDesc')}</span>
        </div>
      </div>

      {/* Product Description Section */}
      {product.longDescription && (
        <section >
          <h2 className="text-2xl font-bold text-primary mb-1">{t('product.description')}</h2>
          <Card className="p-8">
            <div
              className="prose max-w-none prose-headings:text-primary prose-p:text-third prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: product.longDescription }}
            />
            {product.descriptionImages && product.descriptionImages.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                {product.descriptionImages.map((img, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={img}
                      alt={`${product.name} - Description Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      )}

      {/* Specifications Section */}
      {(product.attributes || currentDimensions) && (
        <section >
          <h2 className="text-2xl font-bold text-primary mb-1 ">{t('product.specifications')}</h2>
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {product.attributes?.map((attr) => (
                <div key={attr.name} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="text-third font-medium">{attr.name}</span>
                  <span className="text-primary font-semibold">
                    {selectedOptions[attr.name] || attr.values.map(v => v.value).join(', ')}
                  </span>
                </div>
              ))}
              {currentDimensions && (
                <>
                  {currentDimensions.weight && (
                    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                      <span className="text-third font-medium">{t('product.dims.weight')}</span>
                      <span className="text-primary font-semibold">{currentDimensions.weight} kg</span>
                    </div>
                  )}
                  {currentDimensions.length && (
                    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                      <span className="text-third font-medium">{t('product.dims.length')}</span>
                      <span className="text-primary font-semibold">{currentDimensions.length} cm</span>
                    </div>
                  )}
                  {currentDimensions.width && (
                    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                      <span className="text-third font-medium">{t('product.dims.width')}</span>
                      <span className="text-primary font-semibold">{currentDimensions.width} cm</span>
                    </div>
                  )}
                  {currentDimensions.height && (
                    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                      <span className="text-third font-medium">{t('product.dims.height')}</span>
                      <span className="text-primary font-semibold">{currentDimensions.height} cm</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </section>
      )}

      {/* Reviews Section */}
      <section>
        <ProductReviews
          rating={product.rating}
          reviewCount={product.reviewCount}
        />
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <ProductsSection
            products={relatedProducts}
            title={t('product.relatedProducts')}
            subtitle={t('product.relatedProductsSubtitle')}
            viewAllHref={`/categories/${product.category.slug}`}
            showLoadMore={false}
            showNavArrows={true}
          />
        </section>
      )}
    </>
  );
}
