"use client";

import { notFound, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useVendor } from "@/hooks/useVendors";
import { EntityHeader } from "@/components/ui/entity-header";
import { ProductListingPage } from "@/components/products/product-listing-page";
import { ProductReviews } from "@/components/products/product-reviews";
import { ListingLayout } from "@/components/layout/listing-layout";
import { Star, MapPin, Phone, Mail } from "lucide-react";

export default function VendorPage() {
    const t = useTranslations();
    const locale = useLocale();
    const isAr = locale === 'ar';
    const params = useParams();
    const slug = params.slug as string;
    const vendorId = parseInt(slug.split('-').pop() || '0', 10);

    const { data: vendorData, isLoading: vendorLoading, error: vendorError } = useVendor(vendorId);
    const vendor = vendorData;

    if (vendorLoading) {
        return (
            <div className="container mx-auto">
                <div className="h-64 bg-gray-200 animate-pulse rounded-lg mb-8" />
                <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
            </div>
        );
    }

    if (!Number.isFinite(vendorId) || vendorId <= 0 || vendorError || !vendor) {
        notFound();
    }

    const vendorName = isAr ? vendor.name_ar : vendor.name_en;
    const vendorDesc = isAr ? vendor.description_ar : vendor.description_en;

    // Mock data for now as API doesn't return these yet
    const rating = 4.8;
    const reviewCount = 120;

    const headerContent = (
        <EntityHeader
            title={vendorName || ""}
            image={vendor.logo}
            description={vendorDesc}
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 bg-secondary/10 border border-secondary/25 px-2 py-1 rounded-md text-secondary">
                        <Star className="fill-current w-4 h-4" />
                        <span className="font-bold">{rating}</span>
                    </div>
                    <span className="text-gray-400 text-sm">
                        ({reviewCount} {t("common.reviews")})
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendor.address && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={18} className="text-primary" />
                            <span>{vendor.address}</span>
                        </div>
                    )}
                    {vendor.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Phone size={18} className="text-primary" />
                            <span className="dir-ltr">{vendor.phone}</span>
                        </div>
                    )}
                    {vendor.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={18} className="text-primary" />
                            <span>{vendor.email}</span>
                        </div>
                    )}
                </div>
            </div>
        </EntityHeader>
    );

    return (
        <ListingLayout
            heroContent={headerContent}
            breadcrumbs={[
                { label: t("common.home"), href: "/" },
                { label: t("nav.stores"), href: "/vendors" },
                { label: vendorName, href: `/vendors/${slug}` },
            ]}
        >
            <div className="space-y-16">
                <ProductListingPage
                    initialFilters={{ vendorId }}
                    title={t("common.products")}
                />

                <ProductReviews
                    rating={rating}
                    reviewCount={reviewCount}
                />
            </div>
        </ListingLayout>
    );
}
