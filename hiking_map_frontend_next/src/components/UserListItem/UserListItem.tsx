import { CircleUserRound } from 'lucide-react';

import { Link } from '../../i18n/navigation';

type Props = {
  href: string;
  displayName: string;
  avatar?: string;
  subtitle?: string;
};

export default function UserListItem({ href, displayName, avatar, subtitle }: Props) {
  return (
    <Link
      href={href}
      className="bg-panel rounded-panel hover:bg-panel-active-lighten/50 relative flex w-full items-stretch gap-4 overflow-hidden shadow transition-colors duration-150"
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="h-20 w-20 shrink-0 object-cover" />
      ) : (
        <span className="bg-panel-active flex h-20 w-20 shrink-0 items-center justify-center">
          <CircleUserRound className="text-background-contrary/60 h-8 w-8" />
        </span>
      )}

      <span className="flex min-w-0 flex-col justify-center gap-1 py-2">
        <span className="truncate font-bold">{displayName}</span>
        {subtitle && <span className="text-background-contrary/60 truncate text-sm">{subtitle}</span>}
      </span>
    </Link>
  );
}
