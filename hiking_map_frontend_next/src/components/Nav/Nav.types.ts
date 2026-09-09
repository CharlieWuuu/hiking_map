import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  messageKey: 'home' | 'search' | 'data' | 'profile' | 'settings';
  href: string;
  Icon: LucideIcon;
};
