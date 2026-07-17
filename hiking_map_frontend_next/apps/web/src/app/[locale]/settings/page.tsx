import { useTranslations } from 'next-intl';

import LocaleSwitcher from '../../../components/LocaleSwitcher';
import ThemeSwitcher from '../../../components/ThemeSwitcher';
import { Link } from '../../../i18n/navigation';

export default function SettingsPage() {
  const t = useTranslations('SettingsPage');
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <h1>{t('title')}</h1>
      <div className="bg-panel rounded-panel divide-background-contrary/10 flex flex-col divide-y px-4">
        <LocaleSwitcher />
        <ThemeSwitcher />
      </div>
      <div className="bg-panel rounded-panel px-4">
        <Link href="/settings/intro" className="text-accent flex w-full items-center justify-between py-3">
          {t('goToIntro')}
        </Link>
      </div>
      <div className="bg-panel rounded-panel px-4">
        <button type="button" className="flex w-full items-center justify-between py-3 text-red-400">
          {t('logout')}
        </button>
      </div>
    </div>
  );
}
