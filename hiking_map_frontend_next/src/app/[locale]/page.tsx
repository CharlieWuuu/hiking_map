import { getTranslations } from 'next-intl/server';

import HikeStatsCharts from '../../components/HikeStatsCharts';
import PageLayout from '../../components/PageLayout';
import TrailListItem from '../../components/TrailListItem';
import { Link } from '../../i18n/navigation';
import { apiClient } from '../../lib/apiClient';
import { getCurrentUser } from '../../lib/getCurrentUser';

const RECENT_TRAILS_COUNT = 5;
const RECOMMENDED_TRAILS_COUNT = 5;

export default async function Home() {
  const t = await getTranslations('HomePage');
  const currentUser = await getCurrentUser();

  const [stats, recentHikes, allTrails] = await Promise.all([
    currentUser ? apiClient.hikes.getStats(currentUser.username).catch(() => null) : Promise.resolve(null),
    currentUser ? apiClient.hikes.findAll(String(currentUser.userId)) : Promise.resolve([]),
    apiClient.trails.findAll(),
  ]);
  const recentTrails = [...recentHikes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, RECENT_TRAILS_COUNT);
  const recommendedTrails = allTrails.slice(0, RECOMMENDED_TRAILS_COUNT);

  return (
    <PageLayout>
      {/* 統計一律顯示。未登入時圖表仍畫出空的座標軸，並提示登入 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">{t('yourStats')}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {currentUser && stats ? (
            <Link
              href="/chart"
              className="bg-accent text-accent-contrast rounded-panel flex flex-col justify-between gap-4 p-6 transition-opacity hover:opacity-90 md:col-span-1"
            >
              <span className="text-sm font-medium opacity-70">{t('yourStats')}</span>
              <div className="flex flex-col gap-1">
                <span className="text-4xl font-bold">{t('totalDistanceValue', { distance: stats.totalDistanceKm })}</span>
                <span className="text-sm opacity-70">{t('hikeCountValue', { count: stats.hikeCount })}</span>
              </div>
              <span className="text-sm font-medium underline underline-offset-2">{t('goToProfile')}</span>
            </Link>
          ) : (
            <div className="bg-panel rounded-panel flex flex-col items-center justify-center gap-3 p-6 text-center md:col-span-1">
              <p className="text-background-contrary/60 text-sm">{t('loginPrompt')}</p>
              <Link href="/login" className="bg-panel-active hover:bg-panel-active-lighten rounded-panel w-fit px-4 py-2 text-sm transition-colors">
                {t('loginCta')}
              </Link>
            </div>
          )}
          <div className="md:col-span-2">
            <HikeStatsCharts stats={stats} />
          </div>
        </div>
      </section>

      {currentUser && recentTrails.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{t('recentTrails')}</h2>
          <div className="flex flex-col gap-3">
            {recentTrails.map((hike) => (
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
      )}

      {recommendedTrails.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{t('recommendedTrails')}</h2>
          <div className="grid grid-cols-1 gap-3">
            {recommendedTrails.map((trail, index) =>
              index === 0 ? (
                <Link
                  key={trail.slug}
                  href={`/trails/${trail.slug}`}
                  className="bg-highlight text-highlight-contrast rounded-panel flex w-full flex-col justify-between gap-6 p-6 transition-opacity hover:opacity-90"
                >
                  <span className="bg-accent text-accent-contrast w-fit rounded-full px-2 py-0.5 text-xs font-semibold">{t('featuredTrail')}</span>
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-2xl font-bold">{trail.name}</span>
                      <span className="opacity-60">
                        {trail.county} {trail.town}
                      </span>
                    </div>
                    {trail.distanceKm !== null && (
                      <div className="flex shrink-0 flex-col items-end">
                        <span className="text-xs opacity-60">{t('recommendedDistance')}</span>
                        <span className="text-xl font-bold">{t('recommendedDistanceValue', { distance: trail.distanceKm })}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <Link
                  key={trail.slug}
                  href={`/trails/${trail.slug}`}
                  className="bg-panel hover:bg-panel-active rounded-panel flex w-full items-center gap-4 p-4 transition-colors duration-150"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-lg font-bold">{trail.name}</span>
                    <span className="text-background-contrary/60 text-sm">
                      {trail.county} {trail.town}
                    </span>
                  </div>

                  <div className="bg-panel-active w-0.5 shrink-0 self-stretch" />

                  {trail.distanceKm !== null && (
                    <div className="flex shrink-0 flex-col items-end">
                      <span className="text-background-contrary/60 text-xs">{t('recommendedDistance')}</span>
                      <span className="font-bold">{t('recommendedDistanceValue', { distance: trail.distanceKm })}</span>
                    </div>
                  )}
                </Link>
              )
            )}
          </div>
        </section>
      )}
    </PageLayout>
  );
}
