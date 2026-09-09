import { Bookmark, MapPinned } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

import ChartRing from '../../../components/ChartRing';
import HikeStatsCharts from '../../../components/HikeStatsCharts';
import PageLayout from '../../../components/PageLayout';
import TrailListItem from '../../../components/TrailListItem';
import { Link } from '../../../i18n/navigation';
import { apiClient } from '../../../lib/apiClient';
import { getCurrentUser } from '../../../lib/getCurrentUser';

const TRAIL_HISTORY_COUNT = 10;

export default async function ChartPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  const stats = await apiClient.hikes.getStats(currentUser.username).catch(() => null);
  if (!stats) redirect('/login');

  const hikes = await apiClient.hikes.findAll(String(currentUser.userId));

  const t = await getTranslations('ProfilePage');
  const recentHikes = [...hikes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, TRAIL_HISTORY_COUNT);

  return (
    <PageLayout title={t('title')}>
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
        <Link href="/data" className="bg-panel hover:bg-panel-active rounded-panel flex items-center gap-3 p-5 text-lg transition-colors md:col-span-2">
          <MapPinned className="text-accent h-6 w-6 shrink-0" />
          {t('goToData')}
        </Link>
        <Link href="/collections" className="bg-panel hover:bg-panel-active rounded-panel flex items-center gap-3 p-5 text-lg transition-colors">
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
              href={`/hikes/${hike.id}`}
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
