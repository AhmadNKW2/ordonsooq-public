"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useBrands } from "@/hooks/useBrands";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { slugify } from "@/lib/utils";

export default function BrandsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale === 'ar';
  
  const { data: brandsData, isLoading } = useBrands({
      limit: 100,
      status: 'active',
      visible: true,
      sortBy: 'sort_order',
      sortOrder: 'ASC'
  });

  const brands = brandsData?.data || [];

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="mb-6">
        <Breadcrumb 
          items={[
            { label: t("common.home"), href: "/" },
            { label: t("nav.brands"), href: "/brands" },
          ]} 
        />
      </div>

      <div className="mb-8">
         <h1 className="text-3xl font-bold text-gray-900">{t("nav.brands")}</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {brands.map((brand) => {
            const brandSlug = `${slugify(brand.name_en)}-${brand.id}`;
            return (
            <Link
                key={brand.id}
                href={`/brands/${brandSlug}`}
                className="group block"
            >
              <div className="bg-white border rounded-xl p-6 flex items-center justify-center aspect-square transition-all hover:shadow-lg hover:border-primary/50">
                <div className="relative w-full h-full flex items-center justify-center">
                    {brand.logo ? (
                        <Image
                            src={brand.logo}
                            alt={isAr ? brand.name_ar : brand.name_en}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <span className="text-lg font-semibold text-gray-400">
                            {isAr ? brand.name_ar : brand.name_en}
                        </span>
                    )}
                </div>
              </div>
              <h3 className="mt-3 text-center font-medium text-gray-900 group-hover:text-primary transition-colors">
                {isAr ? brand.name_ar : brand.name_en}
              </h3>
            </Link>
            );
          })}
        </div>
      )}

      {!isLoading && brands.length === 0 && (
        <div className="text-center py-12 text-gray-500">
            <p className="text-lg">{t("common.noResults")}</p>
        </div>
      )}
    </div>
  );
}
