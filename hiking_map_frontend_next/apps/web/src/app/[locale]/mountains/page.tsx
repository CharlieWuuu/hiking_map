import { getTranslations } from 'next-intl/server';

import MountainListItem from '../../../components/MountainListItem';
import { Link } from '../../../i18n/navigation';
import { apiClient } from '../../../lib/apiClient';

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{ page?: string; county?: string }>;
};

export default async function MountainsPage({ searchParams }: Props) {
  const { page: rawPage, county: rawCounty } = await searchParams;

  const allMountains = await apiClient.mountains.findAll();
  const counties = [...new Set(allMountains.map((mountain) => mountain.county).filter((county): county is string => Boolean(county)))].sort();
  const county = counties.includes(rawCounty ?? '') ? rawCounty! : null;

  const mountains = county ? allMountains.filter((mountain) => mountain.county === county) : allMountains;
  const pageCount = Math.max(1, Math.ceil(mountains.length / PAGE_SIZE));
  const page = Math.min(Math.max(Number(rawPage) || 1, 1), pageCount);
  const pagedMountains = mountains.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const t = await getTranslations('MountainsPage');

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href={{ pathname: '/mountains' }}
          className={`rounded-panel px-3 py-1.5 text-sm transition-colors ${!county ? 'bg-accent text-background' : 'bg-panel hover:bg-panel-active'}`}
        >
          {t('allCounties')}
        </Link>
        {counties.map((item) => (
          <Link
            key={item}
            href={{ pathname: '/mountains', query: { county: item } }}
            className={`rounded-panel px-3 py-1.5 text-sm transition-colors ${item === county ? 'bg-accent text-background' : 'bg-panel hover:bg-panel-active'}`}
          >
            {item}
          </Link>
        ))}
      </div>

      {mountains.length === 0 ? (
        <p className="text-background-contrary/60 text-center text-sm">{t('noMountains')}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {pagedMountains.map((mountain) => (
            <MountainListItem
              key={mountain.id}
              href={`/mountains/${mountain.id}`}
              name={mountain.name}
              elevationM={mountain.elevationM}
              range={mountain.range}
              county={mountain.county}
            />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 py-2">
          <Link
            href={{ pathname: '/mountains', query: { ...(county ? { county } : {}), page: String(Math.max(page - 1, 1)) } }}
            aria-disabled={page <= 1}
            className={`bg-panel-active hover:bg-panel-active-lighten rounded-panel px-3 py-1.5 text-sm transition-colors ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
          >
            {t('previousPage')}
          </Link>
          <span className="text-sm">{t('pageIndicator', { page, pageCount })}</span>
          <Link
            href={{ pathname: '/mountains', query: { ...(county ? { county } : {}), page: String(Math.min(page + 1, pageCount)) } }}
            aria-disabled={page >= pageCount}
            className={`bg-panel-active hover:bg-panel-active-lighten rounded-panel px-3 py-1.5 text-sm transition-colors ${page >= pageCount ? 'pointer-events-none opacity-50' : ''}`}
          >
            {t('nextPage')}
          </Link>
        </div>
      )}
    </div>
  );
}
