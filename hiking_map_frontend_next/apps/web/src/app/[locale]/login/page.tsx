import { useTranslations } from 'next-intl';

import { Link } from '../../../i18n/navigation';

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>{t('title')}</h1>
      <Link href="/profile/demo" className="text-accent">
        {t('goToProfileAfterLogin')}
      </Link>
    </div>
  );
}
