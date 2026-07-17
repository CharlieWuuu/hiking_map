'use client';

import { CircleUserRound, Mountain } from 'lucide-react';
import Link from 'next/link';

import type { SearchResultWithRelevance } from '../SearchBar/SearchBar.types';

type Props = {
  item: SearchResultWithRelevance;
};

function subtitle(item: SearchResultWithRelevance): string {
  if (item.type === 'user') return item.level ?? item.bio ?? '使用者';
  return [item.county, item.town].filter(Boolean).join(' ') || '路線';
}

export default function SearchResultRow({ item }: Props) {
  const href = item.type === 'user' ? `/profile/${item.username}` : `/trails/${item.slug}`;

  return (
    <Link href={href} className="hover:bg-panel-active-lighten/50 rounded-panel flex w-full items-center gap-4 px-4 py-3 transition-colors duration-150">
      {item.type === 'user' && item.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="bg-panel-active flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
          {item.type === 'user' ? (
            <CircleUserRound className="text-background-contrary/60 h-6 w-6" />
          ) : (
            <Mountain className="text-background-contrary/60 h-6 w-6" />
          )}
        </span>
      )}

      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-2">
          <span className="truncate font-bold">{item.displayName}</span>
          <span className="text-background-contrary/60 shrink-0 text-xs">{item.type === 'user' ? '使用者' : '路線'}</span>
        </span>
        <span className="text-background-contrary/60 truncate text-sm">{subtitle(item)}</span>
      </span>
    </Link>
  );
}
