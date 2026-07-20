import { getTranslations } from 'next-intl/server';

import SearchResultRow from '../../../../../components/SearchResultRow';
import { Link } from '../../../../../i18n/navigation';
import { MOCK_COLLECTIONS } from '../../../../../testing/mocks/profile/collections.data';

export default async function ProfileCollectionsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const collections = MOCK_COLLECTIONS[username] ?? [];
  const t = await getTranslations('ProfileCollectionsPage');

  return (
    <div className="flex w-full flex-col gap-4">
      <Link
        href={`/profile/${username}`}
        className="bg-panel hover:bg-panel-active/50 rounded-panel flex w-fit items-center px-3 py-1.5 text-sm transition-colors"
      >
        {t('backToProfile')}
      </Link>

      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {collections.length === 0 ? (
        <p className="text-background-contrary/60 text-sm">{t('empty')}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {collections.map((item) => (
            <SearchResultRow key={item.type === 'user' ? item.username : item.slug} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
