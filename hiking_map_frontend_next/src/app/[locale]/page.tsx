import { getTranslations } from 'next-intl/server';

import ChartLine from '../../components/ChartLine';
import PageLayout from '../../components/PageLayout';
import TrailListItem from '../../components/TrailListItem';
import { Link } from '../../i18n/navigation';
import { apiClient } from '../../lib/apiClient';
import { fillMonthlyDistance } from '../../lib/fillMonthlyDistance';
import { getCurrentUser } from '../../lib/getCurrentUser';

const MONTHLY_DISTANCE_MONTHS_COUNT = 12;

export default async function Home() {
  const t = await getTranslations('HomePage');
  const tCharts = await getTranslations('HikeStatsCharts');
  const tCommon = await getTranslations('Common');
  const currentUser = await getCurrentUser();

  const [stats, hikes] = await Promise.all([
    currentUser ? apiClient.hikes.getStats(currentUser.username).catch(() => null) : Promise.resolve(null),
    currentUser ? apiClient.hikes.findAll(String(currentUser.userId)) : Promise.resolve([]),
  ]);
  // 首頁只當一份摘要，最近一次紀錄取一筆就好；完整清單去 /data 看
  const latestHike = [...hikes].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
  // 統計只留一張最能一眼看出趨勢的圖，完整的六張圖表去 /chart 頁看。
  // 改成每月總距離而不是每筆紀錄一個點：紀錄一多，逐筆畫在同一張窄圖上會擠成一團看不出趨勢，
  // 按月加總後資料點數固定（近 12 個月），時間軸間距也均勻
  const trendData = fillMonthlyDistance(stats?.monthlyDistance ?? [], MONTHLY_DISTANCE_MONTHS_COUNT).map((d) => ({
    date: `${d.month}-01`,
    value: d.distanceKm,
  }));

  return (
    <PageLayout>
      {currentUser && (
        <section>
          <h1 className="text-3xl font-bold">{t('greeting', { username: currentUser.username })}</h1>
        </section>
      )}

      {currentUser && latestHike && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{t('latestHike')}</h2>
          <TrailListItem
            href={`/hikes/${latestHike.id}`}
            name={latestHike.name}
            county={latestHike.county ?? ''}
            town={latestHike.town ?? ''}
            date={latestHike.date}
            distanceKm={latestHike.distanceKm}
            coverImageUrl={latestHike.coverImageUrl}
          />
        </section>
      )}

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
          <div className="bg-panel rounded-panel flex h-50 flex-col gap-4 p-4 md:col-span-2">
            <span className="text-background-contrary/60 text-sm">{tCharts('distanceTrend')}</span>
            <ChartLine data={trendData} emptyLabel={tCommon('noData')} />
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
