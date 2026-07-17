import { useTranslations } from 'next-intl';

import LocaleSwitcher from '../../../components/LocaleSwitcher';
import { Link } from '../../../i18n/navigation';

export default function SettingsPage() {
  const t = useTranslations('SettingsPage');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>{t('title')}</h1>
      <LocaleSwitcher />
      <Link href="/settings/intro" className="text-accent">
        {t('goToIntro')}
      </Link>
    </div>
  );
}
