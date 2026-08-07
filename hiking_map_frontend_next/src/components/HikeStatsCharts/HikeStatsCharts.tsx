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

  return (
    <div className="flex flex-wrap gap-4">
      <div className="bg-panel rounded-panel flex h-50 min-w-75 flex-1 flex-col gap-4 p-4">
        <span className="text-background-contrary/60 text-sm">{t('monthlyDistance')}</span>
        <ChartBar
          data={fillMonthlyDistance(stats?.monthlyDistance ?? [], MONTHLY_DISTANCE_MONTHS_COUNT).map((d) => ({
            label: d.month.slice(5),
            value: d.distanceKm,
          }))}
          emptyLabel={tCommon('noData')}
        />
      </div>
      <div className="bg-panel rounded-panel flex h-50 min-w-75 flex-1 flex-col gap-4 p-4">
        <span className="text-background-contrary/60 text-sm">{t('countyStats')}</span>
        <ChartBar
          data={(stats?.countyStats ?? []).slice(0, COUNTY_STATS_COUNT).map((d) => ({ label: d.county, value: d.count }))}
          emptyLabel={tCommon('noData')}
        />
      </div>
    </div>
  );
}
