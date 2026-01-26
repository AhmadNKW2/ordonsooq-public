"use client";

import { useParams } from "next/navigation";
import { useVendor } from "@/hooks/useVendors";
import { EntityListingPage } from "@/components/layout/entity-listing-page";

export default function VendorPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  // Extract vendor ID from slug
  const vendorId = parseInt(slug.split('-').pop() || '0', 10);

  const { data: vendorData, isLoading: vendorLoading, error: vendorError } = useVendor(vendorId);

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
