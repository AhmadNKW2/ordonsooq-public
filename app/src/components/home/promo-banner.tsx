import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Button } from "@/components/ui";
import { useTranslations } from "next-intl";

export function PromoBanner() {
  const t = useTranslations('promo');

  return (
    <section className="">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Promo 1 */}
        <div className="relative h-64 md:h-80 rounded-r1 overflow-hidden group">
          <Link href="/deals" className="absolute inset-0 z-10" aria-label={t('summerCollection')} />
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
            alt={t('summerCollection')}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent pointer-events-none" />
          <div className="absolute inset-0 flex items-center p-8 pointer-events-none z-20">
            <div className="text-third">
              <p className="text-sm uppercase tracking-wider">{t('limitedTime')}</p>
              <h3 className="text-2xl md:text-3xl font-bold">{t('summerCollection')}</h3>
              <p className="opacity-80">{t('summerCollectionDesc')}</p>
              <Link href="/deals" className="pointer-events-auto inline-block mt-4">
                <Button
                  variant="solid"
                  className="bg-white hover:bg-white/90 shadow-gray-200/50 border border-gray-200 text-primary"
                >
                  {t('shopNow')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Promo 2 */}
        <div className="relative h-64 md:h-80 rounded-r1 overflow-hidden group">
          <Link href="/products?filter=new" className="absolute inset-0 z-10" aria-label={t('newArrivals')} />
          <Image
            src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800"
            alt={t('newArrivals')}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-r from-primary/80 to-transparent pointer-events-none" />
          <div className="absolute inset-0 flex items-center p-8 pointer-events-none z-20">
            <div className="text-white">
              <p className="text-sm uppercase tracking-wider">{t('justArrived')}</p>
              <h3 className="text-2xl md:text-3xl font-bold">{t('newArrivals')}</h3>
              <p className="opacity-80">{t('newArrivalsDesc')}</p>
              <Link href="/products?filter=new" className="pointer-events-auto inline-block mt-4">
                <Button
                  variant="solid"
                  className="bg-white hover:bg-white/90 shadow-gray-200/50 border border-gray-200 text-primary"
                >
                  {t('explore')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
