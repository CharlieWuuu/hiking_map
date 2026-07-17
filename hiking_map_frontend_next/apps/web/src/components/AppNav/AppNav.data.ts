import { CircleUserRound, Home, Play, Search, Settings } from 'lucide-react';

import type { NavItem } from './AppNav.types';

// 暫時用假的 username，之後接上登入邏輯後會改成真正登入者的 username
const DEMO_USERNAME = 'demo';

export const NAV_ITEMS: NavItem[] = [
  { messageKey: 'home', href: '/', Icon: Home },
  { messageKey: 'search', href: '/search', Icon: Search },
  { messageKey: 'record', href: '/record', Icon: Play },
  { messageKey: 'profile', href: `/profile/${DEMO_USERNAME}`, Icon: CircleUserRound },
  { messageKey: 'settings', href: '/settings', Icon: Settings },
];
