"use client";

import { useParams } from "next/navigation";
import { useVendorBySlug } from "@/hooks/useVendors";
import { EntityListingPage } from "@/components/layout/entity-listing-page";

export default function VendorPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const { data: vendorData, isLoading: vendorLoading, error: vendorError } = useVendorBySlug(slug);

  return (
    <EntityListingPage 
        type="vendor"
        slug={slug}
        data={vendorData}
        isLoading={vendorLoading}
        error={vendorError}
    />
  );
}
