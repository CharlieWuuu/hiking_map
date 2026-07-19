'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useRouter } from '../../../i18n/navigation';

const OAUTH_PROVIDERS = ['google', 'line', 'facebook'] as const;

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 目前尚未接上真的後端/auth，這裡先模擬登入成功後直接導向 demo 使用者的個人頁
  function mockLogin() {
    router.push(`/profile/demo`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mockLogin();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-6">
        <label className="flex flex-col gap-1">
          <span className="text-background-contrary/60 text-sm">{t('username')}</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="border-background-contrary bg-panel text-background-contrary border-b px-1 py-1.5 outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-background-contrary/60 text-sm">{t('password')}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-background-contrary bg-panel text-background-contrary border-b px-1 py-1.5 outline-none"
          />
        </label>

        <button type="submit" className="bg-panel-active hover:bg-panel-active-lighten rounded-panel w-fit self-center px-4 py-2 transition-colors">
          {t('submit')}
        </button>
      </form>

      <div className="flex w-full max-w-xs items-center gap-3 text-sm">
        <div className="bg-panel-active h-px flex-1" />
        <span className="text-background-contrary/60">{t('orDivider')}</span>
        <div className="bg-panel-active h-px flex-1" />
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        {OAUTH_PROVIDERS.map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={mockLogin}
            className="bg-panel hover:bg-panel-active rounded-panel flex items-center justify-center gap-2 px-4 py-2 transition-colors"
          >
            {t(`oauth.${provider}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
