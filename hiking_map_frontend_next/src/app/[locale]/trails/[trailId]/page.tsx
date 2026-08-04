import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import BackLink from '../../../../components/BackLink';
import TrailLayer from '../../../../components/MapView/TrailLayer';
import PageLayout from '../../../../components/PageLayout';
import { apiClient } from '../../../../lib/apiClient';

// 後端 geojson 目前是 unknown 形狀的 object，LineString 才有座標可畫地圖
function getTrailPath(geojson: object | null): [number, number][] | null {
  if (!geojson || !('type' in geojson) || geojson.type !== 'LineString') return null;
  if (!('coordinates' in geojson)) return null;
  return geojson.coordinates as [number, number][];
}

export default async function TrailDetailPage({ params }: { params: Promise<{ trailId: string }> }) {
  const { trailId } = await params;
  const trail = await apiClient.trails.findOne(trailId).catch(() => null);

  if (!trail) notFound();

  const t = await getTranslations('TrailDetailPage');
  const path = getTrailPath(trail.geojson);

  return (
    <PageLayout align="center" title={trail.name} before={<BackLink href="/search">{t('back')}</BackLink>}>
      <div className="flex flex-wrap justify-around gap-4">
        <div className="flex flex-col items-center">
          <span className="text-background-contrary/60 text-xs">{t('distance')}</span>
          <p className="text-lg">{trail.distanceKm !== null ? t('distanceValue', { distance: trail.distanceKm }) : t('noValue')}</p>
        </div>
      </div>

      {trail.description && (
        <section className="flex flex-col items-start gap-4">
          <h2 className="text-2xl font-bold">{t('intro')}</h2>
          <p className="text-background-contrary/80">{trail.description}</p>
        </section>
      )}

      {path && (
        <section className="flex flex-col items-start gap-4">
          <h2 className="text-2xl font-bold">{t('map')}</h2>
          <TrailLayer path={path} />
        </section>
      )}
    </PageLayout>
  );
}
