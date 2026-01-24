"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  HeroBanner,
  ShopBySection,
  ProductsSection,
  FeaturesSection,
  Newsletter,
} from "@/components/home";
import type { ShopByItem } from "@/components/home/shop-by-section";
import { useProducts, useHome, useListingVariantProducts } from "@/hooks";
import { transformHomeData, type Locale } from "@/lib/transformers";
import { ProductGridSkeleton, CategoryCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const locale = useLocale() as Locale;
  const t = useTranslations('home');

  // Fetch home data (categories, vendors, banners)
  const { 
    data: homeData, 
    isLoading: homeLoading,
    error: homeError 
  } = useHome();

  // Fetch featured products (visible and in stock)
  const { 
    data: featuredData, 
    isLoading: featuredLoading,
    error: featuredError 
  } = useProducts({ 
    limit: 8, 
    status: 'active',
    visible: true,
    sortBy: 'average_rating',
    sortOrder: 'DESC'
  });

  // Fetch new products (visible and in stock)
  const { 
    data: newData, 
    isLoading: newLoading,
    error: newError 
  } = useProducts({ 
    limit: 8, 
    status: 'active',
    visible: true,
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  // Transform home data (categories, vendors, banners) with locale
  const { categories, vendors, banners, brands } = homeData 
    ? transformHomeData(homeData, locale) 
    : { categories: [], vendors: [], banners: [], brands: [] };

  const categoryItems: ShopByItem[] = categories.map((category) => ({
    id: category.id,
    href: `/categories/${category.slug}`,
    name: category.name,
    image: category.image,
    isCategory: true,
  }));

  const brandItems: ShopByItem[] = brands.map((brand) => ({
    id: brand.id,
    href: `/brands/${brand.slug}`,
    name: brand.name,
    image: brand.logo,
    isCategory: false,
  }));

  const vendorItems: ShopByItem[] = vendors.map((vendor) => ({
    id: vendor.id,
    href: `/vendors/${vendor.slug}`,
    name: vendor.name,
    image: vendor.logo,
    isCategory: false,
  }));
  const { products: featuredProductsRaw, isLoading: featuredVariantsLoading } =
    useListingVariantProducts(featuredData?.data, locale);
  const { products: newProductsRaw, isLoading: newVariantsLoading } =
    useListingVariantProducts(newData?.data, locale);

  const featuredProducts = featuredProductsRaw;
  const newProducts = newProductsRaw;

  return (
    <>
      {/* Hero Banner */}
      <section className="pt-0">
        {homeLoading ? (
          <Skeleton className="h-100 rounded-2xl" />
        ) : (
          <HeroBanner banners={banners} />
        )}
      </section>

      {/* Categories Carousel */}
      <section>
        {homeLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <ShopBySection
            title={t('shopByCategory')}
            subtitle={t('exploreCategories')}
              items={categoryItems}
              viewAllHref="/categories"
          />
        )}
      </section>

      {/* Featured Products */}
      <section>
        {featuredLoading || featuredVariantsLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductsSection
            products={featuredProducts}
            title={t('featuredProducts')}
            subtitle={t('featuredSubtitle')}
          />
        )}
      </section>

      {/* Features Section */}
      <section>
        <FeaturesSection />
      </section>

      {/* Brands Section */}
      <section>
        {homeLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-r1" />
            ))}
          </div>
        ) : (
          <ShopBySection
            title={t('shopByBrand')}
            subtitle={t('trustedBrands')}
              items={brandItems}
              viewAllHref="/brands"
          />
        )}
      </section>

      {/* Vendors Section */}
      <section>
        {homeLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-r1" />
            ))}
          </div>
        ) : (
          <ShopBySection
            title={t('shopByVendor')}
            subtitle={t('trustedVendors')}
              items={vendorItems}
              viewAllHref="/vendors"
          />
        )}
      </section>

      {/* New Arrivals */}
      <section>
        {newLoading || newVariantsLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductsSection
            products={newProducts}
            title={t('newArrivals')}
            subtitle={t('newArrivalsSubtitle')}
            viewAllHref="/products?filter=new"
          />
        )}
      </section>

      {/* Newsletter */}
      <section>
        <Newsletter />
      </section>
    </>
  );
}

