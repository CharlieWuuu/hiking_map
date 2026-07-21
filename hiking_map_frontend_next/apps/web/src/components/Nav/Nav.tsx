'use client';

import { PanelLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import LogoMark from '../../assets/logo-mark.svg?react';
import Logo from '../../assets/logo.svg?react';
import { Link, usePathname } from '../../i18n/navigation';
import { useAuth } from '../../lib/AuthContext';
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
      <nav className="bg-panel border-nav-border fixed right-0 bottom-0 left-0 z-50 flex justify-around border-t py-4 lg:hidden">
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

      {/* 寬螢幕：左側導覽列 */}
      <nav
        className="bg-panel border-nav-border fixed top-0 left-0 z-50 hidden h-full flex-col gap-6 border-r px-4 py-8 lg:flex"
        style={{ width: 'var(--nav-width)' }}
      >
        <Link href="/" className="flex items-center justify-center overflow-hidden">
          {isCollapsed ? <LogoMark /> : <Logo className="h-auto max-w-full" />}
        </Link>
        <div className="flex flex-col gap-2">
          {navItems.map(({ messageKey, href, Icon }) => (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? t(messageKey) : undefined}
              className={`hover:bg-panel-active-lighten/50 rounded-panel flex items-center gap-2 px-2 py-2 transition-colors duration-150 ${
                isCollapsed ? 'justify-center' : ''
              } ${isActive(pathname, href) ? 'text-accent' : 'text-background-contrary'}`}
            >
              <Icon className="h-6 w-6 shrink-0" />
              {!isCollapsed && t(messageKey)}
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={toggleCollapsed}
          className="hover:bg-panel-active-lighten/50 rounded-panel text-background-contrary/60 mt-auto flex h-10 w-10 items-center justify-center self-end transition-colors duration-150"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      </nav>
    </>
  );
}
