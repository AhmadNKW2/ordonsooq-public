"use client";

import { notFound, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useBrand } from "@/hooks/useBrands";
import { EntityHeader } from "@/components/ui/entity-header";
import { ProductListingPage } from "@/components/products/product-listing-page";
import { ListingLayout } from "@/components/layout/listing-layout";

export default function BrandPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale === 'ar';
  const params = useParams();
  const slug = params.slug as string;
  
  // Extract brand ID from slug
  const brandId = parseInt(slug.split('-').pop() || slug, 10);

  const { data: brandData, isLoading: brandLoading, error: brandError } = useBrand(brandId);
  const brand = brandData; 

  if (brandLoading) {
    return (
      <div className="container mx-auto">
         <div className="h-48 bg-gray-200 animate-pulse rounded-lg mb-8" />
         <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (brandError || !brand) {
    notFound();
  }

  const brandName = isAr ? brand.name_ar : brand.name_en;
  const brandDesc = isAr ? brand.description_ar : brand.description_en;

  const headerContent = (
      <EntityHeader
        title={brandName || ""}
        image={brand.logo}
        description={brandDesc}
      />
  );


  return (
    <ListingLayout
      heroContent={headerContent}
      breadcrumbs={[
        { label: t("common.home"), href: "/" },
        { label: t("nav.brands"), href: "/brands" },
        { label: brandName, href: `/brands/${slug}` },
      ]}
    >
      <ProductListingPage 
        initialFilters={{ brandId }}
        title={t("common.products")} 
      />
    </ListingLayout>
  );
}
