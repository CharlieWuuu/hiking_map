'use client';

import { CircleUserRound, Mountain } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '../../i18n/navigation';
import type { SearchResultWithRelevance } from '../SearchBar/SearchBar.types';

type Props = {
  item: SearchResultWithRelevance;
};

function subtitle(item: SearchResultWithRelevance, fallback: string): string {
  if (item.type === 'user') return item.level ?? item.bio ?? fallback;
  return [item.county, item.town].filter(Boolean).join(' ') || fallback;
}

export default function SearchResultRow({ item }: Props) {
  const t = useTranslations('SearchResult');
  const href = item.type === 'user' ? `/profile/${item.username}` : `/trails/${item.slug}`;
  const typeLabel = item.type === 'user' ? t('user') : t('trail');
  const thumbnail = item.type === 'user' ? item.avatar : item.thumbnail;

  return (
    <Link
      href={href}
      className="bg-panel rounded-panel hover:bg-panel-active-lighten/50 relative flex w-full items-stretch gap-4 overflow-hidden shadow transition-colors duration-150"
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbnail} alt="" className="h-20 w-20 shrink-0 object-cover" />
      ) : (
        <span className="bg-panel-active flex h-20 w-20 shrink-0 items-center justify-center">
          {item.type === 'user' ? (
            <CircleUserRound className="text-background-contrary/60 h-8 w-8" />
          ) : (
            <Mountain className="text-background-contrary/60 h-8 w-8" />
          )}
        </span>
      )}

      <span className="flex min-w-0 flex-col justify-center gap-1 py-2">
        <span className="flex items-center gap-2">
          <span className="truncate font-bold">{item.displayName}</span>
          <span className="text-background-contrary/60 shrink-0 text-xs">{typeLabel}</span>
        </span>
        <span className="text-background-contrary/60 truncate text-sm">{subtitle(item, typeLabel)}</span>
      </span>
    </Link>
  );
}
