import { getTranslations } from 'next-intl/server';

import SearchBar from '../../../components/SearchBar';
import SearchResultRow from '../../../components/SearchResultRow';
import { getFullSearchResults } from '../../../testing/mocks/search/search.fake-api';

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const results = getFullSearchResults(q);
  const t = await getTranslations('SearchPage');

  return (
    <div className="flex h-full flex-col gap-4">
      <SearchBar />

      {q && results.length === 0 && <p className="text-background-contrary/60 text-center text-sm">{t('noResults', { query: q })}</p>}

      {q && results.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {results.map((item) => (
            <SearchResultRow key={`${item.type}-${item.type === 'user' ? item.username : item.slug}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
