import { ChartPie, Home, Map, Search, Settings } from 'lucide-react';

import type { NavItem } from './Nav.types';

// 個人頁需要登入者的 username 才能組出連結，未登入時導去登入頁
export function getNavItems(username: string | null): NavItem[] {
  return [
    { messageKey: 'home', href: '/', Icon: Home },
    { messageKey: 'search', href: '/search', Icon: Search },
    // 未登入時沒有自己的 data 頁可去，跟個人頁一樣導去登入頁
    { messageKey: 'data', href: username ? `/profile/${username}/data` : '/login', Icon: Map },
    { messageKey: 'profile', href: username ? `/profile/${username}` : '/login', Icon: ChartPie },
    { messageKey: 'settings', href: '/settings', Icon: Settings },
  ];
}
