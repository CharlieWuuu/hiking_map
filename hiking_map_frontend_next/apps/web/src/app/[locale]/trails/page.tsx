import { useTranslations } from 'next-intl';

import { Link } from '../../../i18n/navigation';

export default function TrailsPage() {
  const t = useTranslations('TrailsPage');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>{t('title')}</h1>
      <Link href="/trails/trail-1" className="text-accent">
        {t('goToDemoTrail')}
      </Link>
    </div>
  );
}
