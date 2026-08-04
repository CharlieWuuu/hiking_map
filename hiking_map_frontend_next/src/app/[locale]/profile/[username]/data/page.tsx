import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import BackLink from '../../../../../components/BackLink';
import PageLayout from '../../../../../components/PageLayout';
import { apiClient } from '../../../../../lib/apiClient';
import { getCurrentUser } from '../../../../../lib/getCurrentUser';
import ProfileTrailExplorerWithNavigation from './_components/ProfileTrailExplorerWithNavigation';

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ fullscreen?: string; edit?: string }>;
};

// 後端 hike_tracks.geom 是 MultiLineString，這裡只取第一條線來畫圖
function getHikePath(geojson: object | null | undefined): [number, number][] {
  if (!geojson || !('type' in geojson) || !('coordinates' in geojson)) return [];
  if (geojson.type === 'LineString') return geojson.coordinates as [number, number][];
  if (geojson.type === 'MultiLineString') return (geojson.coordinates as [number, number][][])[0] ?? [];
  return [];
}

export default async function ProfileDataPage({ params, searchParams }: Props) {
  const { username } = await params;
  const { fullscreen: rawFullscreen, edit } = await searchParams;
  const fullscreen = rawFullscreen === 'map' ? 'map' : rawFullscreen === 'table' ? 'table' : null;
  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.username === username;
  const isEditMode = edit === 'true' && isOwner;

  const profile = await apiClient.profile.getByUsername(username).catch(() => null);
  if (!profile) notFound();

  const hikes = await apiClient.hikes.findAll(String(profile.userId), true);
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
  }));

  const t = await getTranslations('ProfileDataPage');

  return (
    <PageLayout before={<BackLink href={`/profile/${username}`}>{t('backToProfile')}</BackLink>}>
      <div className="h-150">
        <ProfileTrailExplorerWithNavigation username={username} trails={trails} fullscreen={fullscreen} isEditMode={isEditMode} isOwner={isOwner} />
      </div>
    </PageLayout>
  );
}
