"use client";

import { useParams } from "next/navigation";
import { useBrandBySlug } from "@/hooks/useBrands";
import { EntityListingPage } from "@/components/layout/entity-listing-page";

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const { data: brandData, isLoading: brandLoading, error: brandError } = useBrandBySlug(slug);

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
