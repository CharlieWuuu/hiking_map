'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 暫時用假的 username，之後接上登入邏輯後會改成真正登入者的 username
const DEMO_USERNAME = 'demo';

const NAV_ITEMS = [
  { label: '首頁', href: '/' },
  { label: '探索', href: '/search' },
  { label: '記錄', href: '/record' },
  { label: '個人頁', href: `/profile/${DEMO_USERNAME}` },
  { label: '設定', href: '/settings' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export default function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* 窄螢幕：底部導覽列 */}
      <nav className="bg-panel fixed right-0 bottom-0 left-0 z-50 flex justify-around py-2 lg:hidden">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? 'text-accent' : 'text-background-contrary'}>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 寬螢幕：左側導覽列 */}
      <nav className="bg-panel fixed top-0 left-0 z-50 hidden h-full w-40 flex-col gap-6 p-4 lg:flex">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? 'text-accent' : 'text-background-contrary'}>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
