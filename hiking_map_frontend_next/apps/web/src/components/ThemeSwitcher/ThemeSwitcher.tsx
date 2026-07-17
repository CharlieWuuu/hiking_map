'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { applyTheme, getStoredTheme } from '../../lib/theme';

export default function ThemeSwitcher() {
  const t = useTranslations('SettingsPage');
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(getStoredTheme() === 'dark');
  }, []);

  function toggle() {
    const next = !isDark;
    applyTheme(next ? 'dark' : 'light');
    setIsDark(next);
  }

  return (
    <div className="flex w-full items-center justify-between py-3">
      <span>{t('darkMode')}</span>
      <button
        type="button"
        role="switch"
        aria-checked={isDark ?? undefined}
        onClick={toggle}
        disabled={isDark === null}
        className={`relative block h-7 w-12 shrink-0 cursor-pointer rounded-full p-0 transition-colors ${
          isDark === null ? 'invisible' : isDark ? 'bg-accent-darken' : 'bg-panel-active'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}
