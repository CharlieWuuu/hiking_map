'use client';

import { useTranslations } from 'next-intl';

import { useTheme } from '../../hooks/useTheme';
import Switch from '../Switch';

export default function ThemeSwitcher() {
  const t = useTranslations('SettingsPage');
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex w-full items-center justify-between py-3">
      <span>{t('darkMode')}</span>
      <Switch checked={theme === 'dark'} onChange={(next) => setTheme(next ? 'dark' : 'light')} />
    </div>
  );
}
