"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useBrands } from "@/hooks/useBrands";
import { ListingLayout } from "@/components/layout/listing-layout";
import { Skeleton } from "@/components/ui/skeleton";

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
    <ListingLayout
      title={t("nav.brands")}
      breadcrumbs={[
        { label: t("common.home"), href: "/" },
        { label: t("nav.brands"), href: "/brands" },
      ]}
    >
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <Link 
                key={brand.id} 
                href={`/brands/brand-${brand.id}`}
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
          ))}
        </div>
      )}

      {!isLoading && brands.length === 0 && (
        <div className="text-center py-12 text-gray-500">
            <p className="text-lg">{t("common.noResults")}</p>
        </div>
      )}
    </ListingLayout>
  );
}
