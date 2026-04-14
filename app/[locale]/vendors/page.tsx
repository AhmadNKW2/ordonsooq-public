import { getTranslations } from "next-intl/server";
import { EntityGridPage } from "@/components/layout/entity-grid-page";
import { vendorService } from "@/services/vendor.service";

export default async function VendorsPage() {
  const t = await getTranslations("nav");
  const vendorsData = await vendorService.getAll({
    limit: 100,
    status: "active",
    visible: true,
    sortBy: "sort_order",
    sortOrder: "ASC",
  }).catch(() => null);

  const vendors = Array.isArray(vendorsData) ? vendorsData : vendorsData?.data || [];

  return (
    <EntityGridPage
      type="vendor"
      data={vendors}
      isLoading={false}
      title={t("stores")}
    />
  );
}
