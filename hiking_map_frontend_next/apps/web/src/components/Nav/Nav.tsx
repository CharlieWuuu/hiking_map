'use client';

import { PanelLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import LogoMark from '../../assets/logo-mark.svg?react';
import Logo from '../../assets/logo.svg?react';
import { Link, usePathname } from '../../i18n/navigation';
import { useAuth } from '../../lib/authStore';
import { NAV_COLLAPSED_STORAGE_KEY } from './Nav.const';
import { getNavItems } from './Nav.data';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export default function Nav() {
  const pathname = usePathname();
  const t = useTranslations('Nav');
  const { username } = useAuth();
  const navItems = getNavItems(username);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(localStorage.getItem(NAV_COLLAPSED_STORAGE_KEY) === 'true');
  }, []);

  function toggleCollapsed() {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem(NAV_COLLAPSED_STORAGE_KEY, String(next));
    document.documentElement.classList.toggle('nav-collapsed', next);
  }

  return (
    <>
      {/* 窄螢幕：底部導覽列 */}
      <nav className="bg-nav border-nav-border fixed right-0 bottom-0 left-0 z-50 flex justify-around border-t py-4 lg:hidden">
        {navItems.map(({ messageKey, href, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 text-xs ${isActive(pathname, href) ? 'text-accent' : 'text-background-contrary'}`}
          >
            <Icon className="h-6 w-6" />
            {t(messageKey)}
          </Link>
        ))}
      </nav>

      {/* 寬螢幕：左側導覽列。在正常流中排版，寬度變化不需要 main 那邊補償 */}
      <nav
        className="bg-nav border-nav-border sticky top-0 hidden h-dvh shrink-0 flex-col gap-4 border-r px-4 py-8 lg:flex"
        style={{ width: 'var(--nav-width)' }}
      >
        {/* 內距與下方選單項目相同，logo 因此和項目共用同一條左緣與同一個寬度上限 */}
        <Link href="/" className={`flex items-center overflow-hidden ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
          {isCollapsed ? <LogoMark className="h-7 w-7" /> : <Logo className="h-auto w-full" />}
        </Link>
        <div className="flex flex-col gap-1">
          {navItems.map(({ messageKey, href, Icon }) => (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? t(messageKey) : undefined}
              className={`hover:bg-panel-active-lighten/50 rounded-panel flex items-center gap-2 py-2 text-sm transition-colors duration-150 ${
                isCollapsed ? 'justify-center px-0' : 'px-3'
              } ${isActive(pathname, href) ? 'text-accent' : 'text-background-contrary'}`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {!isCollapsed && t(messageKey)}
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={toggleCollapsed}
          className={`hover:bg-panel-active-lighten/50 rounded-panel text-background-contrary/60 mt-auto flex h-8 w-8 items-center justify-center transition-colors duration-150 ${
            isCollapsed ? 'self-center' : 'self-end'
          }`}
        >
          <PanelLeft className="h-4.5 w-4.5" />
        </button>
      </nav>
    </>
  );
}
