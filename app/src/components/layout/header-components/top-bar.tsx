"use client";

import { useTranslations } from "next-intl";

export function TopBar() {
  const t = useTranslations('topBar');
  
  return (
    <div className="bg-secondary text-white py-2 text-center text-sm">
      <p>{t('announcement', { code: 'FREESHIP' })}</p>
    </div>
  );
}
