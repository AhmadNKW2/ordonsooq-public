"use client";

import { FREE_SHIPPING_MIN_ORDER_AMOUNT } from "@/lib/constants";
import { useTranslations } from "next-intl";

export function TopBar() {
  const t = useTranslations('topBar');
  
  return (
    <div className="bg-secondary text-white py-2 text-center text-sm">
      <p>{t('announcement', { amount: FREE_SHIPPING_MIN_ORDER_AMOUNT })}</p>
    </div>
  );
}
