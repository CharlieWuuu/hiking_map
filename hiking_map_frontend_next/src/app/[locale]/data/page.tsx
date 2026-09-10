import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

import PageLayout from '../../../components/PageLayout';
import { apiClient } from '../../../lib/apiClient';
import { getCurrentUser } from '../../../lib/getCurrentUser';
import ProfileTrailExplorerWithNavigation from './_components/ProfileTrailExplorerWithNavigation';

type Props = {
  searchParams: Promise<{ fullscreen?: string; edit?: string; lat?: string; lng?: string; z?: string }>;
};

// 後端回傳的是簡化過的 MultiLineString，這裡只取第一條線來畫圖。
// 放大到 DETAIL_ZOOM 以上時，地圖會自己去 R2 換上完整軌跡
function getHikePath(geojson: object | null | undefined): [number, number][] {
  if (!geojson || !('type' in geojson) || !('coordinates' in geojson)) return [];
  if (geojson.type === 'LineString') return geojson.coordinates as [number, number][];
  if (geojson.type === 'MultiLineString') return (geojson.coordinates as [number, number][][])[0] ?? [];
  return [];
}

const PAGE_SIZE = 20;

export default async function DataPage({ searchParams }: Props) {
  const { fullscreen: rawFullscreen, edit, lat, lng, z } = await searchParams;
  const fullscreen = rawFullscreen === 'map' ? 'map' : rawFullscreen === 'table' ? 'table' : null;
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');
  const isOwner = true;
  const isEditMode = edit === 'true';

  // 網址帶著地圖視野走，重新整理／分享連結都能回到原本看的位置
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  const parsedZoom = Number(z);
  const initialViewport =
    Number.isFinite(parsedLat) && Number.isFinite(parsedLng) && Number.isFinite(parsedZoom)
      ? { center: [parsedLat, parsedLng] as [number, number], zoom: parsedZoom }
      : null;

  // 清單只拿第一頁；往後翻頁由 ProfileTrailExplorer 在瀏覽器端用 cursor 逐頁向後端要，
  // 不再一次把所有紀錄（含簡化 geojson）都撈回來
  const { items: hikes, totalCount, nextCursor } = await apiClient.hikes.findAllPaginated(String(currentUser.userId), PAGE_SIZE, undefined, true);
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
    mountainIds: hike.mountainIds ?? [],
    urls: hike.urls,
    note: hike.note ?? undefined,
    path: getHikePath(hike.geojson),
    trackUrl: hike.trackUrl,
    bbox: hike.bbox,
  }));

  const t = await getTranslations('ProfileDataPage');

  return (
    <PageLayout title={t('title')} subtitle={t('subtitle', { count: totalCount })}>
      <div className="page-wide min-h-150 flex-1">
        <ProfileTrailExplorerWithNavigation
          trails={trails}
          totalCount={totalCount}
          initialNextCursor={nextCursor}
          userId={String(currentUser.userId)}
          fullscreen={fullscreen}
          isEditMode={isEditMode}
          isOwner={isOwner}
          initialViewport={initialViewport}
        />
      </div>
    </PageLayout>
  );
}
