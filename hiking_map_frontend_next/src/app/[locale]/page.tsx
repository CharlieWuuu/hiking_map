import { getTranslations } from 'next-intl/server';

import ChartBar from '../../components/ChartBar';
import PageLayout from '../../components/PageLayout';
import TrailListItem from '../../components/TrailListItem';
import { Link } from '../../i18n/navigation';
import { apiClient } from '../../lib/apiClient';
import { fillMonthlyDistance } from '../../lib/fillMonthlyDistance';
import { getCurrentUser } from '../../lib/getCurrentUser';

const RECENT_TRAILS_COUNT = 5;
const RECOMMENDED_TRAILS_COUNT = 5;
const COUNTY_STATS_COUNT = 7;
const MONTHLY_DISTANCE_MONTHS_COUNT = 12;

export default async function Home() {
  const t = await getTranslations('HomePage');
  const tCommon = await getTranslations('Common');
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
      {currentUser && stats && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{t('yourStats')}</h2>
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
              <ChartBar
                data={stats.countyStats.slice(0, COUNTY_STATS_COUNT).map((d) => ({ label: d.county, value: d.count }))}
                emptyLabel={tCommon('noData')}
              />
            </div>
          </div>
          <Link
            href={`/profile/${currentUser.username}`}
            className="bg-panel hover:bg-panel-active rounded-panel w-fit self-center px-4 py-2 text-sm transition-colors"
          >
            {t('goToProfile')}
          </Link>
        </section>
      )}

      {currentUser && recentTrails.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{t('recentTrails')}</h2>
          <div className="flex flex-col gap-3">
            {recentTrails.map((hike) => (
              <TrailListItem
                key={hike.id}
                href={`/profile/${currentUser.username}/hikes/${hike.id}`}
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
          <div className="flex flex-col gap-3">
            {recommendedTrails.map((trail) => (
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
            ))}
          </div>
        </section>
      )}
    </PageLayout>
  );
}
