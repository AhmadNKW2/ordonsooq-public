"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useVendors } from "@/hooks/useVendors";
import { ListingLayout } from "@/components/layout/listing-layout";
import { Star } from "lucide-react";

export default function VendorsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale === 'ar';
  
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
    <ListingLayout
      title={t("nav.stores")}
      breadcrumbs={[
        { label: t("common.home"), href: "/" },
        { label: t("nav.stores"), href: "/vendors" },
      ]}
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vendors.map((vendor) => (
            <Link 
                key={vendor.id} 
                href={`/vendors/${vendor.id}`} // Vendor ID is clean
                className="group block bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="relative h-40 bg-gray-50 flex items-center justify-center p-6 border-b">
                 {vendor.logo ? (
                     <div className="relative w-full h-full">
                        <Image
                            src={vendor.logo}
                            alt={isAr ? vendor.name_ar : vendor.name_en}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                     </div>
                 ) : (
                    <span className="text-2xl font-bold text-gray-300">
                        {isAr ? vendor.name_ar : vendor.name_en}
                    </span>
                 )}
              </div>
              <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                    {isAr ? vendor.name_ar : vendor.name_en}
                  </h3>
                   
                  {/* Static Rating as requested */}
                  <div className="flex items-center gap-1 text-yellow-500 mb-2">
                      <Star className="fill-current w-4 h-4" />
                      <span className="font-medium text-gray-900">4.8</span>
                      <span className="text-gray-400 text-sm">(120)</span>
                  </div>

                  {(isAr ? vendor.description_ar : vendor.description_en) && (
                    <p className="text-gray-500 text-sm line-clamp-2">
                        {isAr ? vendor.description_ar : vendor.description_en}
                    </p>
                  )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && vendors.length === 0 && (
        <div className="text-center py-12 text-gray-500">
            <p className="text-lg">{t("common.noResults")}</p>
        </div>
      )}
    </ListingLayout>
  );
}
