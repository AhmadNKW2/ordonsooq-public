"use client";

import { useTranslations } from "next-intl";
import { useVendors } from "@/hooks/useVendors";
import { EntityGridPage } from "@/components/layout/entity-grid-page";

export default function VendorsPage() {
  const t = useTranslations("nav");
  
  const { data: vendorsData, isLoading } = useVendors({
      limit: 100,
      status: 'active',
      visible: true,
      sortBy: 'sort_order',
      sortOrder: 'ASC'
  });

  // Handle potential API response variations (wrapped vs unwrapped)
  const vendors = Array.isArray(vendorsData) 
      ? vendorsData 
      : (vendorsData?.data || []);

  return (
    <EntityGridPage
        type="vendor"
        data={vendors}
        isLoading={isLoading}
        title={t("stores")}
    />
  );
}
