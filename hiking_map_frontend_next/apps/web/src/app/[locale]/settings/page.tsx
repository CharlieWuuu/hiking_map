import { useTranslations } from 'next-intl';

import PageLayout from '../../../components/PageLayout';
import { Link } from '../../../i18n/navigation';
import LocaleSelector from './_components/LocaleSelector';
import LogoutButton from './_components/LogoutButton';
import ThemeSwitcher from './_components/ThemeSwitcher';

export default function SettingsPage() {
  const t = useTranslations('SettingsPage');
  return (
    <PageLayout title={t('title')}>
      <div className="flex flex-col gap-4">
        <div className="bg-panel rounded-panel divide-background-contrary/10 flex flex-col divide-y px-4">
          <LocaleSelector />
          <ThemeSwitcher />
        </div>
        <div className="bg-panel rounded-panel px-4">
          <Link href="/settings/intro" className="text-accent flex w-full items-center justify-between py-3">
            {t('goToIntro')}
          </Link>
        </div>
        <div className="bg-panel rounded-panel px-4">
          <LogoutButton />
        </div>
      </div>
    </PageLayout>
  );
}
