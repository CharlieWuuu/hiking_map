import { useTranslations } from 'next-intl';

import { Link } from '../../../../i18n/navigation';

export default function SettingsIntroPage() {
  const t = useTranslations('SettingsIntroPage');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>{t('title')}</h1>
      <Link href="/settings" className="text-accent">
        {t('backToSettings')}
      </Link>
    </div>
  );
}
