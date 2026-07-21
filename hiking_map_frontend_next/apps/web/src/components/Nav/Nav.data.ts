import { CircleUserRound, Home, Play, Search, Settings } from 'lucide-react';

import type { NavItem } from './Nav.types';

// 個人頁需要登入者的 username 才能組出連結，未登入時導去登入頁
export function getNavItems(username: string | null): NavItem[] {
  return [
    { messageKey: 'home', href: '/', Icon: Home },
    { messageKey: 'search', href: '/search', Icon: Search },
    { messageKey: 'record', href: '/record', Icon: Play },
    { messageKey: 'profile', href: username ? `/profile/${username}` : '/login', Icon: CircleUserRound },
    { messageKey: 'settings', href: '/settings', Icon: Settings },
  ];
}
