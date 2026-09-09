import { getTranslations } from 'next-intl/server';

import BackLink from '../../../../../components/BackLink';
import PageLayout from '../../../../../components/PageLayout';
import TrailListItem from '../../../../../components/TrailListItem';
import UserListItem from '../../../../../components/UserListItem';
import { apiClient } from '../../../../../lib/apiClient';

export default async function ProfileCollectionsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const collections = await apiClient.collections.findByUsername(username).catch(() => []);
  const t = await getTranslations('ProfileCollectionsPage');
  const tResult = await getTranslations('SearchResult');

  return (
    <PageLayout title={t('title')} before={<BackLink href={`/profile/${username}`}>{t('backToProfile')}</BackLink>}>
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
                subtitle={tResult('user')}
              />
            ) : item.itemType === 'trail' ? (
              <TrailListItem key={`trail-${item.id}`} href={`/trails/${item.trailSlug}`} name={item.trailName ?? ''} county="" town="" />
            ) : null
          )}
        </div>
      )}
    </PageLayout>
  );
}
