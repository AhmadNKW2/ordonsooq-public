"use client";

import { useTranslations } from "next-intl";
import { useBrands } from "@/hooks/useBrands";
import { EntityGridPage } from "@/components/layout/entity-grid-page";

export default function BrandsPage() {
  const t = useTranslations("nav");
  
  const { data: brandsData, isLoading } = useBrands({
      limit: 100,
      status: 'active',
      visible: true,
      sortBy: 'sort_order',
      sortOrder: 'ASC'
  });

  const brands = brandsData?.data || [];

  return (
    <EntityGridPage
        type="brand"
        data={brands}
        isLoading={isLoading}
        title={t("brands")}
    />
  );
}
