import { getLocale, getTranslations } from "next-intl/server";
import { EntityGridPage } from "@/components/layout/entity-grid-page";
import { transformCategories, type Locale } from "@/lib/transformers";
import { categoryService } from "@/services/category.service";

export default async function CategoriesPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("categories");
  const data = await categoryService.getRootCategories({
    status: "active",
    limit: 50,
    sortBy: "sortOrder",
    sortOrder: "ASC",
  }).catch(() => null);

  const categories = data?.data ? transformCategories(data.data, locale) : [];

  return (
    <EntityGridPage
      type="category"
      data={categories}
      isLoading={false}
      title={t("shopByCategory")}
      subtitle={t("shopByCategoryDesc")}
    />
  );
}
