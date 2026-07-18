'use client';

import { useTranslations } from 'next-intl';

import { Link, usePathname } from '../../i18n/navigation';
import Logo from '../Logo';
import { NAV_ITEMS } from './AppNav.data';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export default function AppNav() {
  const pathname = usePathname();
  const t = useTranslations('AppNav');
  const tMetadata = useTranslations('Metadata');

  return (
    <>
      {/* 窄螢幕：底部導覽列 */}
      <nav className="bg-panel border-nav-border fixed right-0 bottom-0 left-0 z-50 flex justify-around border-t py-4 lg:hidden">
        {NAV_ITEMS.map(({ messageKey, href, Icon }) => (
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
      <nav className="bg-panel border-nav-border fixed top-0 left-0 z-50 hidden h-full w-56 flex-col gap-6 border-r px-6 py-8 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-background-contrary font-bold">{tMetadata('title')}</span>
        </Link>
        <div className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ messageKey, href, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`hover:bg-panel-active-lighten/50 rounded-panel flex items-center gap-2 px-2 py-2 transition-colors duration-150 ${
                isActive(pathname, href) ? 'text-accent' : 'text-background-contrary'
              }`}
            >
              <Icon className="h-6 w-6" />
              {t(messageKey)}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
