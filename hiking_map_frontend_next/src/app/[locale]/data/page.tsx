import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

import PageLayout from '../../../components/PageLayout';
import { apiClient } from '../../../lib/apiClient';
import { getCurrentUser } from '../../../lib/getCurrentUser';
import ProfileTrailExplorerWithNavigation from './_components/ProfileTrailExplorerWithNavigation';

type Props = {
  searchParams: Promise<{ fullscreen?: string; edit?: string }>;
};

// 後端回傳的是簡化過的 MultiLineString，這裡只取第一條線來畫圖。
// 放大到 DETAIL_ZOOM 以上時，地圖會自己去 R2 換上完整軌跡
function getHikePath(geojson: object | null | undefined): [number, number][] {
  if (!geojson || !('type' in geojson) || !('coordinates' in geojson)) return [];
  if (geojson.type === 'LineString') return geojson.coordinates as [number, number][];
  if (geojson.type === 'MultiLineString') return (geojson.coordinates as [number, number][][])[0] ?? [];
  return [];
}

export default async function DataPage({ searchParams }: Props) {
  const { fullscreen: rawFullscreen, edit } = await searchParams;
  const fullscreen = rawFullscreen === 'map' ? 'map' : rawFullscreen === 'table' ? 'table' : null;
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');
  const isOwner = true;
  const isEditMode = edit === 'true';

  const hikes = await apiClient.hikes.findAll(String(currentUser.userId), true);
  const trails = hikes.map((hike) => ({
    slug: String(hike.id),
    name: hike.name,
    county: hike.county ?? '',
    town: hike.town ?? '',
    date: hike.date,
    distanceKm: hike.distanceKm,
    isPublic: hike.isPublic,
    isHundred: hike.isHundred ?? false,
    isSmallHundred: hike.isSmallHundred ?? false,
    isHundredTrail: hike.isHundredTrail ?? false,
    urls: hike.urls,
    note: hike.note ?? undefined,
    path: getHikePath(hike.geojson),
    trackUrl: hike.trackUrl,
    bbox: hike.bbox,
  }));

  const t = await getTranslations('ProfileDataPage');

  return (
    <PageLayout title={t('title')} subtitle={t('subtitle', { count: trails.length })}>
      <div className="page-wide min-h-150 flex-1">
        <ProfileTrailExplorerWithNavigation trails={trails} fullscreen={fullscreen} isEditMode={isEditMode} isOwner={isOwner} />
      </div>
    </PageLayout>
  );
}
