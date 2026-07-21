import { getTranslations } from 'next-intl/server';

import TrailListItem from '../../../../../components/TrailListItem';
import UserListItem from '../../../../../components/UserListItem';
import { Link } from '../../../../../i18n/navigation';
import { MOCK_COLLECTIONS } from '../../../../../testing/mocks/profile/collections.data';

export default async function ProfileCollectionsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const collections = MOCK_COLLECTIONS[username] ?? [];
  const t = await getTranslations('ProfileCollectionsPage');
  const tResult = await getTranslations('SearchResult');

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
          {collections.map((item) =>
            item.type === 'user' ? (
              <UserListItem
                key={`user-${item.username}`}
                href={`/profile/${item.username}`}
                displayName={item.displayName}
                avatar={item.avatar}
                subtitle={item.level ?? item.bio ?? tResult('user')}
              />
            ) : (
              <TrailListItem
                key={`trail-${item.slug}`}
                href={`/trails/${item.slug}`}
                name={item.displayName}
                county={item.county ?? ''}
                town={item.town ?? ''}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
