"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRootCategories } from "@/hooks/useCategories";
import { transformCategories, type Locale } from "@/lib/transformers";
import { EntityGridPage } from "@/components/layout/entity-grid-page";

export default function CategoriesPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations('categories');
  const { data, isLoading, error } = useRootCategories({ 
    status: 'active',
    limit: 50,
    sortBy: 'sortOrder',
    sortOrder: 'ASC'
  });

  const categories = data?.data ? transformCategories(data.data, locale) : [];

  return (
     <EntityGridPage
        type="category"
        data={categories}
        isLoading={isLoading}
        title={t('shopByCategory')}
        subtitle={t('shopByCategoryDesc')}
        error={error}
     />
  );
}
