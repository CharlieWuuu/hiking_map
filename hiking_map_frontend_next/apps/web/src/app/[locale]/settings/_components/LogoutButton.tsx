'use client';

import { useTranslations } from 'next-intl';

import { useRouter } from '../../../../i18n/navigation';
import { useAuth } from '../../../../lib/AuthContext';

export default function LogoutButton() {
  const t = useTranslations('SettingsPage');
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <button type="button" onClick={handleLogout} className="flex w-full items-center justify-between py-3 text-red-400">
      {t('logout')}
    </button>
  );
}
