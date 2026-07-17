import { useTranslations } from 'next-intl';

import { Link } from '../../../i18n/navigation';

export default function RecordPage() {
  const t = useTranslations('RecordPage');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <Link href="/profile/demo" className="text-accent">
        {t('goToProfile')}
      </Link>
    </div>
  );
}
