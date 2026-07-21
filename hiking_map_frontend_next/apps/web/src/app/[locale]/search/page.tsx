import { getTranslations } from 'next-intl/server';

import SearchResultRow from '../../../components/SearchResultRow';
import { Link } from '../../../i18n/navigation';
import { getFullSearchResults, getTrailsByFilter } from '../../../testing/mocks/search/search.fake-api';
import { MOCK_TRAIL_DETAILS, TRAIL_CATEGORIES, type TrailCategory } from '../../../testing/mocks/trails/trails.data';
import SearchBarWithNavigation from './_components/SearchBarWithNavigation';

type Props = {
  searchParams: Promise<{ q?: string; category?: string; county?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', category: rawCategory, county: rawCounty } = await searchParams;
  const category = TRAIL_CATEGORIES.includes(rawCategory as TrailCategory) ? (rawCategory as TrailCategory) : null;
  const counties = [...new Set(MOCK_TRAIL_DETAILS.map((trail) => trail.county))];
  const county = counties.includes(rawCounty ?? '') ? rawCounty! : null;
  const t = await getTranslations('SearchPage');

  const isFiltering = Boolean(category || county);
  const results = q ? getFullSearchResults(q) : isFiltering ? getTrailsByFilter(category, county) : [];

  return (
    <div className="flex h-full flex-col gap-4">
      <SearchBarWithNavigation />

      {q && results.length === 0 && <p className="text-background-contrary/60 text-center text-sm">{t('noResults', { query: q })}</p>}
      {!q && isFiltering && results.length === 0 && <p className="text-background-contrary/60 text-center text-sm">{t('noTrails')}</p>}

      {(q || isFiltering) && results.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {results.map((item) => (
            <SearchResultRow key={`${item.type}-${item.type === 'user' ? item.username : item.slug}`} item={item} />
          ))}
        </div>
      )}

      {!q && !isFiltering && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-background-contrary/60 text-sm">{t('categoryFilter')}</span>
            <div className="grid grid-cols-3 gap-3">
              {TRAIL_CATEGORIES.map((item) => (
                <Link
                  key={item}
                  href={{ pathname: '/search', query: { category: item } }}
                  className="bg-panel hover:bg-panel-active rounded-panel px-4 py-6 text-center text-lg font-bold transition-colors"
                >
                  {t(item)}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-background-contrary/60 text-sm">{t('countyFilter')}</span>
            <div className="grid grid-cols-3 gap-3">
              {counties.map((item) => (
                <Link
                  key={item}
                  href={{ pathname: '/search', query: { county: item } }}
                  className="bg-panel hover:bg-panel-active rounded-panel px-4 py-6 text-center text-lg font-bold transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
