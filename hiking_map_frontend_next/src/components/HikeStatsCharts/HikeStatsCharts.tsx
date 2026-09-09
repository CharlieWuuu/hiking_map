import { getTranslations } from 'next-intl/server';

import type { HikeStats } from '../../lib/api/adapters/hikes';
import { fillMonthlyDistance } from '../../lib/fillMonthlyDistance';
import ChartBar from '../ChartBar';

const COUNTY_STATS_COUNT = 7;
const MONTHLY_DISTANCE_MONTHS_COUNT = 12;

type Props = {
  // 未登入或查無資料時傳 null，圖表會畫出空的座標軸
  stats: Pick<HikeStats, 'monthlyDistance' | 'countyStats'> | null;
};

export default async function HikeStatsCharts({ stats }: Props) {
  const t = await getTranslations('HikeStatsCharts');
  const tCommon = await getTranslations('Common');

  const monthlyData = fillMonthlyDistance(stats?.monthlyDistance ?? [], MONTHLY_DISTANCE_MONTHS_COUNT).map((d) => ({
    label: d.month.slice(5),
    value: d.distanceKm,
  }));
  const countyData = (stats?.countyStats ?? []).slice(0, COUNTY_STATS_COUNT).map((d) => ({ label: d.county, value: d.count }));

  const peakMonth = monthlyData.reduce((max, d) => (d.value > max.value ? d : max), monthlyData[0]);
  const topCounty = countyData[0];

  return (
    <div className="flex flex-wrap gap-4">
      <div className="bg-panel rounded-panel flex h-50 min-w-75 flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-background-contrary/60 text-sm">{t('monthlyDistance')}</span>
          {peakMonth && peakMonth.value > 0 && (
            <span className="bg-accent text-accent-contrast rounded-full px-2 py-0.5 text-xs font-semibold">
              {t('peakMonth', { month: peakMonth.label, distance: peakMonth.value })}
            </span>
          )}
        </div>
        <ChartBar data={monthlyData} emptyLabel={tCommon('noData')} />
      </div>
      <div className="bg-panel rounded-panel flex h-50 min-w-75 flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-background-contrary/60 text-sm">{t('countyStats')}</span>
          {topCounty && topCounty.value > 0 && (
            <span className="bg-accent text-accent-contrast rounded-full px-2 py-0.5 text-xs font-semibold">
              {t('topCounty', { county: topCounty.label, count: topCounty.value })}
            </span>
          )}
        </div>
        <ChartBar data={countyData} emptyLabel={tCommon('noData')} />
      </div>
    </div>
  );
}
