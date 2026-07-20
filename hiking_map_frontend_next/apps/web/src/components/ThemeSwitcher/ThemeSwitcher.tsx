'use client';

import { useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';

import { applyTheme, getServerTheme, getStoredTheme, subscribeTheme } from '../../lib/theme';
import Switch from '../Switch';

export default function ThemeSwitcher() {
  const t = useTranslations('SettingsPage');
  const theme = useSyncExternalStore(subscribeTheme, getStoredTheme, getServerTheme);

  function toggle(next: boolean) {
    applyTheme(next ? 'dark' : 'light');
  }

  return (
    <div className="flex w-full items-center justify-between py-3">
      <span>{t('darkMode')}</span>
      <Switch checked={theme === 'dark'} onChange={toggle} />
    </div>
  );
}
