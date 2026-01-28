import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  const t = useTranslations('notFound');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16">
      <div className="bg-gray-50 p-6 rounded-full mb-6">
        <FileQuestion className="w-16 h-16 text-gray-400" />
      </div>
      <h1 className="text-4xl md:text-6xl font-extrabold text-primary/80 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('title')}</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
        {t('description')}
      </p>
      <Link href="/">
        <Button size="lg" className="min-w-[200px]">
          {t('backHome')}
        </Button>
      </Link>
    </div>
  );
}
