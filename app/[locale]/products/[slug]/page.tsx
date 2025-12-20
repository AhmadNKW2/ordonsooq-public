"use client";

import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Star, Truck, Shield, RotateCcw, Store, ChevronRight } from "lucide-react";
import { useProduct, useProductsByCategory } from "@/hooks";
import { useWishlist } from "@/hooks/use-wishlist";
import { transformProduct, transformProducts, type Locale } from "@/lib/transformers";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import { ProductGallery, ProductsSection, ProductOptions } from "@/components";
import { Badge, Card, IconButton, PageWrapper } from "@/components/ui";
import { ProductActions } from "./product-actions";

export default function ProductPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const params = useParams();
  const slug = params.slug as string;
  const { toggleItem, isInWishlist } = useWishlist();

  // Extract product ID from slug (format: product-name-ID)
  const productId = parseInt(slug.split('-').pop() || '0', 10);

  const { data: productData, isLoading, error } = useProduct(productId);

  // Fetch related products by category
  const categoryId = productData?.category?.id;
  const { data: relatedData } = useProductsByCategory(
    categoryId || 0,
    { limit: 4, status: 'active' }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
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

  if (error || !productData) {
    notFound();
  }

  const product = transformProduct(productData, locale);
  const relatedProducts = relatedData?.data
    ? transformProducts(relatedData.data, locale).filter(p => p.id !== product.id)
    : [];

  const discount = product.compareAtPrice
    ? calculateDiscount(product.compareAtPrice, product.price)
    : 0;

  return (
    <PageWrapper className="container mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-third mb-6">
        <ol className="flex items-center gap-2">
          <li><a href="/" className="hover:text-primary">Home</a></li>
          <li>/</li>
          <li><a href="/products" className="hover:text-primary">Products</a></li>
          <li>/</li>
          <li><a href={`/categories/${product.category.slug}`} className="hover:text-primary">{product.category.name}</a></li>
          <li>/</li>
          <li className="text-primary font-medium truncate max-w-50">{product.name}</li>
        </ol>
      </nav>

      {/* Product Details - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Gallery - Column 1 */}
        <div className="lg:col-span-5">
          <ProductGallery
            images={product.images}
            productName={product.name}
            wishlistButton={
              <IconButton
                onClick={() => toggleItem(product)}
                isActive={isInWishlist(product.id)}
                className={cn(
                  "shadow-lg hover:scale-110",
                  !isInWishlist(product.id) && "bg-white/90 backdrop-blur-sm"
                )}
                aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
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
            {product.isNew && <Badge variant="new">New Arrival</Badge>}
            {discount > 0 && <Badge variant="sale">-{discount}% OFF</Badge>}
            {product.stock <= 5 && product.stock > 0 && (
              <Badge variant="warning">Only {product.stock} left!</Badge>
            )}
          </div>

          {/* Title & Brand */}
          <div>
            {product.brand && (
              <p className="text-sm text-primary font-medium">{product.brand.name}</p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(product.rating)
                      ? "fill-secondary text-secondary"
                      : "fill-gray-200 text-third"
                    }`}
                />
              ))}
            </div>
            <span className="text-third">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
                <span className="text-xl text-third opacity-70 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-third leading-relaxed">
            {product.description}
          </p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <ProductOptions variants={product.variants} />
          )}

          {/* Actions */}
          <ProductActions product={product} />

          {/* Features */}
          <div className="grid grid-cols-3 gap-5 pt-6 border-t border-gray-100">
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
              <Truck className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Free Shipping</span>
              <span className="text-xs text-third">Orders over $50</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
              <RotateCcw className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Easy Returns</span>
              <span className="text-xs text-third">30-day policy</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Secure</span>
              <span className="text-xs text-third">Safe checkout</span>
            </div>
          </div>
        </div>

        {/* Vendor Info - Column 3 */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Vendor Card */}
          <Card className="p-4 flex justify-between">
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
                <p className="text-xs text-third">Sold by</p>
                <p className="font-semibold text-primary">
                  {product.vendor?.name || "OrdonSooq"}
                </p>
                {product.vendor && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-secondary text-secondary" />
                    <span className="text-xs text-third">
                      {product.vendor.rating} ({product.vendor.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <a
              href={`/vendors/${product.vendor?.slug || 'ordonsooq'}`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Visit Store <ChevronRight className="w-4 h-4" />
            </a>
          </Card>

          {/* Other Sellers */}
          {product.otherSellers && product.otherSellers.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-primary">
                Check offers from {product.otherSellers.length} other sellers
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
                        View offer
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
              <p>SKU: <span className="text-primary">{product.sku}</span></p>
              <p>Category: <a href={`/categories/${product.category.slug}`} className="text-primary hover:underline">{product.category.name}</a></p>
              {product.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span>Tags:</span>
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
            </div>
          </Card>
        </div>
      </div>

      {/* Product Description Section */}
      {product.longDescription && (
        <section >
          <h2 className="text-2xl font-bold text-primary">Product Description</h2>
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

      {/* Reviews Section - Placeholder for future API integration */}
      {product.reviewCount > 0 && (
        <section >
          <h2 className="text-2xl font-bold text-primary">Customer Reviews</h2>
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${i < Math.floor(product.rating)
                        ? "fill-secondary text-secondary"
                        : "fill-gray-200 text-third"
                      }`}
                  />
                ))}
              </div>
              <span className="text-xl font-bold text-primary">{product.rating}</span>
            </div>
            <p className="text-third">Based on {product.reviewCount} reviews</p>
          </Card>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <ProductsSection
            products={relatedProducts}
            title="Related Products"
            subtitle="You might also like these"
            viewAllHref={`/categories/${product.category.slug}`}
            showLoadMore={false}
            showNavArrows={true}
          />
        </section>
      )}
    </PageWrapper>
  );
}
