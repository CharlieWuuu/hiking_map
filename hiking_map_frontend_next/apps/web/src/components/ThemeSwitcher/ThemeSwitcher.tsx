'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function ThemeSwitcher() {
  const t = useTranslations('SettingsPage');
  const [isDark, setIsDark] = useState(true);

  return (
    <div className="flex w-full items-center justify-between py-3">
      <span>{t('darkMode')}</span>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={() => setIsDark((prev) => !prev)}
        className={`relative block h-7 w-12 shrink-0 cursor-pointer rounded-full p-0 transition-colors ${isDark ? 'bg-accent-darken' : 'bg-panel-active'}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
