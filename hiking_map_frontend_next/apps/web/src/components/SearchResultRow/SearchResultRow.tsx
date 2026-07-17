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
          <span className="text-background-contrary/60 shrink-0 text-xs">{typeLabel}</span>
        </span>
        <span className="text-background-contrary/60 truncate text-sm">{subtitle(item, typeLabel)}</span>
      </span>
    </Link>
  );
}
