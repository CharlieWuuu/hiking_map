import { Bookmark, CircleUserRound, MapPinned, Upload } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import ChartRing from '../../../../components/ChartRing';
import HikeStatsCharts from '../../../../components/HikeStatsCharts';
import PageLayout from '../../../../components/PageLayout';
import TrailListItem from '../../../../components/TrailListItem';
import { Link } from '../../../../i18n/navigation';
import { apiClient } from '../../../../lib/apiClient';
import { getCurrentUser } from '../../../../lib/getCurrentUser';
import EditProfileButton from './_components/EditProfileButton';

const TRAIL_HISTORY_COUNT = 10;

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const [profile, stats, currentUser] = await Promise.all([
    apiClient.profile.getByUsername(username).catch(() => null),
    apiClient.hikes.getStats(username).catch(() => null),
    getCurrentUser(),
  ]);

  if (!profile || !stats) notFound();

  const hikes = await apiClient.hikes.findAll(String(profile.userId));

  const isOwner = currentUser?.username === username;

  const t = await getTranslations('ProfilePage');
  const recentHikes = [...hikes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, TRAIL_HISTORY_COUNT);

  return (
    <PageLayout>
      {/* 個人資訊 */}
      <div className="flex items-center gap-8">
        {profile.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar} alt="" className="border-accent rounded-panel h-30 w-30 shrink-0 border-4 object-cover" />
        ) : (
          <span className="bg-panel-active border-accent rounded-panel flex h-30 w-30 shrink-0 items-center justify-center border-4">
            <CircleUserRound className="text-background-contrary/60 h-16 w-16" />
          </span>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-accent text-3xl font-bold">{profile.username}</h1>
            {isOwner && <EditProfileButton avatar={profile.avatar} description={profile.description} />}
            {isOwner && (
              <Link
                href="/hikes/new"
                className="bg-panel-active hover:bg-panel-active-lighten rounded-panel ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors"
              >
                <Upload className="h-4 w-4" />
                {t('uploadHike')}
              </Link>
            )}
          </div>
          {profile.description && <p className="text-background-contrary/80">{profile.description}</p>}
        </div>
      </div>

      {/* Bento：總覽數據 + 成就 + 圖表 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-accent text-accent-contrast rounded-panel flex flex-col justify-between gap-6 p-6 md:col-span-1 md:row-span-2">
          <span className="text-sm font-medium opacity-70">{t('totalDistanceLabel')}</span>
          <div className="flex flex-1 flex-col items-start justify-center gap-2">
            <span className="text-6xl font-bold">{t('totalDistance', { distance: stats.totalDistanceKm })}</span>
            <span className="text-sm opacity-70">{t('hikeCount', { count: stats.hikeCount })}</span>
          </div>
        </div>
        <div className="bg-highlight text-highlight-contrast rounded-panel flex flex-wrap items-center justify-around gap-4 p-6 md:col-span-2">
          <ChartRing label={t('achievementHundred')} value={stats.achievements.hundred} />
          <ChartRing label={t('achievementSmallHundred')} value={stats.achievements.smallHundred} />
          <ChartRing label={t('achievementHundredTrail')} value={stats.achievements.hundredTrail} />
        </div>
        <div className="md:col-span-2">
          <HikeStatsCharts stats={stats} />
        </div>
      </div>

      {/* 地圖／表格導覽 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href={`/profile/${username}/data`}
          className="bg-panel hover:bg-panel-active rounded-panel flex items-center gap-3 p-5 text-lg transition-colors md:col-span-2"
        >
          <MapPinned className="text-accent h-6 w-6 shrink-0" />
          {t('goToData')}
        </Link>
        <Link
          href={`/profile/${username}/collections`}
          className="bg-panel hover:bg-panel-active rounded-panel flex items-center gap-3 p-5 text-lg transition-colors"
        >
          <Bookmark className="text-accent h-6 w-6 shrink-0" />
          {t('goToCollections')}
        </Link>
      </div>

      {/* 歷次軌跡 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">{t('trailHistory')}</h2>
        <div className="flex flex-col gap-3">
          {recentHikes.map((hike) => (
            <TrailListItem
              key={hike.id}
              href={`/profile/${username}/hikes/${hike.id}`}
              name={hike.name}
              county={hike.county ?? ''}
              town={hike.town ?? ''}
              date={hike.date}
              distanceKm={hike.distanceKm}
              coverImageUrl={hike.coverImageUrl}
            />
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
