import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  messageKey: 'home' | 'search' | 'record' | 'profile' | 'settings';
  href: string;
  Icon: LucideIcon;
};
