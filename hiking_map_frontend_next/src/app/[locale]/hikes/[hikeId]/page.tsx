import { getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

import BackLink from '../../../../components/BackLink';
import TrailLayer from '../../../../components/MapView/TrailLayer';
import PageLayout from '../../../../components/PageLayout';
import { apiClient } from '../../../../lib/apiClient';
import { getCurrentUser } from '../../../../lib/getCurrentUser';

// 後端 hike_tracks.geom 是 MultiLineString，這裡只取第一條線來畫圖
function getHikePath(geojson: object | null | undefined): [number, number][] {
  if (!geojson || !('type' in geojson) || !('coordinates' in geojson)) return [];
  if (geojson.type === 'LineString') return geojson.coordinates as [number, number][];
  if (geojson.type === 'MultiLineString') return (geojson.coordinates as [number, number][][])[0] ?? [];
  return [];
}

export default async function HikeDetailPage({ params }: { params: Promise<{ hikeId: string }> }) {
  const { hikeId } = await params;
  const id = Number(hikeId);
  if (!Number.isInteger(id)) notFound();

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  const hike = await apiClient.hikes.findOne(id).catch(() => null);
  if (!hike || hike.userId !== currentUser.userId) notFound();

  const t = await getTranslations('HikeDetailPage');
  const path = getHikePath(hike.geojson);

  return (
    <PageLayout
      align="center"
      title={hike.name}
      subtitle={(hike.county || hike.town) && `${hike.county} ${hike.town}`}
      before={<BackLink href="/data">{t('backToProfile')}</BackLink>}
    >
      <div className="bg-panel rounded-panel grid w-full grid-cols-2 gap-4 p-4 sm:grid-cols-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-background-contrary/60 text-xs">{t('date')}</span>
          <p className="text-lg font-bold">{hike.date}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-background-contrary/60 text-xs">{t('distance')}</span>
          <p className="text-lg font-bold">{t('distanceValue', { distance: hike.distanceKm })}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-background-contrary/60 text-xs">{t('links')}</span>
          {hike.urls.length > 0 ? (
            hike.urls.map((url, index) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="text-accent block text-lg font-bold">
                {t('linkLabel', { index: index + 1 })}
              </a>
            ))
          ) : (
            <p className="text-lg font-bold">{t('noValue')}</p>
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-background-contrary/60 text-xs">{t('note')}</span>
          <p className="text-lg font-bold">{hike.note ?? t('noValue')}</p>
        </div>
      </div>

      <section className="flex w-full flex-col items-start gap-4">
        <h2 className="text-2xl font-bold">{t('map')}</h2>
        <div className="bg-panel rounded-panel w-full overflow-hidden p-2">
          <TrailLayer path={path} />
        </div>
      </section>
    </PageLayout>
  );
}
