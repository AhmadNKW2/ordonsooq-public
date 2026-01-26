"use client";

import { useParams } from "next/navigation";
import { useBrand } from "@/hooks/useBrands";
import { EntityListingPage } from "@/components/layout/entity-listing-page";

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  // Extract brand ID from slug
  const brandId = parseInt(slug.split('-').pop() || '0', 10);

  const { data: brandData, isLoading: brandLoading, error: brandError } = useBrand(brandId);

  return (
    <EntityListingPage 
        type="brand"
        slug={slug}
        data={brandData}
        isLoading={brandLoading}
        error={brandError}
    />
  );
}
