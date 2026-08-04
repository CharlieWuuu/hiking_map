import { getTranslations } from 'next-intl/server';

import TrailListItem from '../../../../../components/TrailListItem';
import UserListItem from '../../../../../components/UserListItem';
import { Link } from '../../../../../i18n/navigation';
import { apiClient } from '../../../../../lib/apiClient';

export default async function ProfileCollectionsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const collections = await apiClient.collections.findByUsername(username).catch(() => []);
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
            item.itemType === 'user' ? (
              <UserListItem
                key={`user-${item.id}`}
                href={`/profile/${item.username}`}
                displayName={item.username ?? ''}
                avatar={item.avatar ?? undefined}
                subtitle={item.level ?? tResult('user')}
              />
            ) : item.itemType === 'trail' ? (
              <TrailListItem key={`trail-${item.id}`} href={`/trails/${item.trailSlug}`} name={item.trailName ?? ''} county="" town="" />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
