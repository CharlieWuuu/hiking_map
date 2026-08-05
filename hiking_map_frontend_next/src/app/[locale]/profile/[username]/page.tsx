import { CircleUserRound } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import ChartBar from '../../../../components/ChartBar';
import ChartRing from '../../../../components/ChartRing';
import PageLayout from '../../../../components/PageLayout';
import TrailListItem from '../../../../components/TrailListItem';
import { Link } from '../../../../i18n/navigation';
import { apiClient } from '../../../../lib/apiClient';
import { fillMonthlyDistance } from '../../../../lib/fillMonthlyDistance';
import { getCurrentUser } from '../../../../lib/getCurrentUser';
import EditProfileButton from './_components/EditProfileButton';

const TRAIL_HISTORY_COUNT = 10;
const COUNTY_STATS_COUNT = 7;
const MONTHLY_DISTANCE_MONTHS_COUNT = 12;

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
  const tCommon = await getTranslations('Common');
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
          </div>
          <div className="flex flex-wrap gap-4 text-lg">
            <span>{t('totalDistance', { distance: stats.totalDistanceKm })}</span>
            <span>{t('hikeCount', { count: stats.hikeCount })}</span>
          </div>
          {profile.description && <p className="text-background-contrary/80">{profile.description}</p>}
        </div>
      </div>

      {/* 成就 */}
      <div className="flex flex-wrap justify-around gap-4">
        <ChartRing label={t('achievementHundred')} value={stats.achievements.hundred} />
        <ChartRing label={t('achievementSmallHundred')} value={stats.achievements.smallHundred} />
        <ChartRing label={t('achievementHundredTrail')} value={stats.achievements.hundredTrail} />
      </div>

      {/* 統計圖表 */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-panel rounded-panel flex h-50 min-w-75 flex-1 flex-col gap-4 p-4">
          <span className="text-background-contrary/60 text-sm">{t('monthlyDistance')}</span>
          <ChartBar
            data={fillMonthlyDistance(stats.monthlyDistance, MONTHLY_DISTANCE_MONTHS_COUNT).map((d) => ({
              label: d.month.slice(5),
              value: d.distanceKm,
            }))}
            emptyLabel={tCommon('noData')}
          />
        </div>
        <div className="bg-panel rounded-panel flex h-50 min-w-75 flex-1 flex-col gap-4 p-4">
          <span className="text-background-contrary/60 text-sm">{t('countyStats')}</span>
          <ChartBar data={stats.countyStats.slice(0, COUNTY_STATS_COUNT).map((d) => ({ label: d.county, value: d.count }))} emptyLabel={tCommon('noData')} />
        </div>
      </div>

      {/* 地圖／表格導覽 */}
      <div className="flex gap-4">
        <Link href={`/profile/${username}/data`} className="bg-panel hover:bg-panel-active rounded-panel flex-1 py-4 text-center text-lg transition-colors">
          {t('goToData')}
        </Link>
        <Link
          href={`/profile/${username}/collections`}
          className="bg-panel hover:bg-panel-active rounded-panel flex-1 py-4 text-center text-lg transition-colors"
        >
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
