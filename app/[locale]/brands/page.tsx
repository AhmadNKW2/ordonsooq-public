import { getTranslations } from "next-intl/server";
import { EntityGridPage } from "@/components/layout/entity-grid-page";
import { brandService } from "@/services/brand.service";

export default async function BrandsPage() {
  const t = await getTranslations("nav");
  const brandsData = await brandService.getAll({
    limit: 100,
    status: "active",
    visible: true,
    sortBy: "sort_order",
    sortOrder: "ASC",
  }).catch(() => null);

  return (
    <EntityGridPage
      type="brand"
      data={brandsData?.data || []}
      isLoading={false}
      title={t("brands")}
    />
  );
}
