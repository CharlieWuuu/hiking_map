import { CircleUserRound, Home, Play, Search, Settings } from 'lucide-react';

import type { NavItem } from './AppNav.types';

// 暫時用假的 username，之後接上登入邏輯後會改成真正登入者的 username
const DEMO_USERNAME = 'demo';

export const NAV_ITEMS: NavItem[] = [
  { label: '首頁', href: '/', Icon: Home },
  { label: '探索', href: '/search', Icon: Search },
  { label: '記錄', href: '/record', Icon: Play },
  { label: '個人頁', href: `/profile/${DEMO_USERNAME}`, Icon: CircleUserRound },
  { label: '設定', href: '/settings', Icon: Settings },
];
