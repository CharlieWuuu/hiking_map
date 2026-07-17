'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV_ITEMS } from './AppNav.data';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export default function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* 窄螢幕：底部導覽列 */}
      <nav className="bg-panel fixed right-0 bottom-0 left-0 z-50 flex justify-around py-4 lg:hidden">
        {NAV_ITEMS.map(({ label, href, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 text-xs ${isActive(pathname, href) ? 'text-accent' : 'text-background-contrary'}`}
          >
            <Icon className="h-6 w-6" />
            {label}
          </Link>
        ))}
      </nav>

      {/* 寬螢幕：左側導覽列 */}
      <nav className="bg-panel fixed top-0 left-0 z-50 hidden h-full w-40 flex-col gap-6 p-4 lg:flex">
        {NAV_ITEMS.map(({ label, href, Icon }) => (
          <Link key={href} href={href} className={`flex items-center gap-2 ${isActive(pathname, href) ? 'text-accent' : 'text-background-contrary'}`}>
            <Icon className="h-6 w-6" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
