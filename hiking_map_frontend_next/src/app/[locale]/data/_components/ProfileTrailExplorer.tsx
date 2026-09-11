'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import TrailsLayer, { type MapTrail } from '../../../../components/MapView/TrailsLayer';
import type { EditableTrail } from '../../../../components/TrailEditCard';
import { apiClient } from '../../../../lib/apiClient';
import { useMapStore } from '../../../../lib/mapStore';
import ExpandToggleButton from './ExpandToggleButton';
import TrailExplorerList from './TrailExplorerList';
import TrailExplorerToolbar from './TrailExplorerToolbar';
import TrailListPagination from './TrailListPagination';

type Trail = EditableTrail & Pick<MapTrail, 'path' | 'trackUrl' | 'bbox'>;

const PAGE_SIZE = 20;

type Props = {
  trails: Trail[];
  totalCount: number;
  initialNextCursor: string | null;
  userId: string;
  fullscreen: 'map' | 'table' | null;
  isEditMode: boolean;
  isOwner: boolean;
  onFullscreenChange: (next: 'map' | 'table' | null) => void;
  onToggleEditMode: () => void;
  initialViewport: { center: [number, number]; zoom: number } | null;
};

// 後端回傳的是簡化過的 MultiLineString，這裡只取第一條線來畫圖
function getHikePath(geojson: object | null | undefined): [number, number][] {
  if (!geojson || !('type' in geojson) || !('coordinates' in geojson)) return [];
  if (geojson.type === 'LineString') return geojson.coordinates as [number, number][];
  if (geojson.type === 'MultiLineString') return (geojson.coordinates as [number, number][][])[0] ?? [];
  return [];
}

export default function ProfileTrailExplorer({
  trails: initialTrails,
  totalCount,
  initialNextCursor,
  userId,
  fullscreen,
  isEditMode,
  isOwner,
  onFullscreenChange,
  onToggleEditMode,
  initialViewport,
}: Props) {
  const t = useTranslations('ProfileDataPage');
  const [trails, setTrails] = useState(initialTrails);
  // hover/選取狀態放在 map store，清單與地圖不必再靠 props 互相轉發
  const activeSlug = useMapStore((state) => state.activeSlug);
  const setHoverSlug = useMapStore((state) => state.setHoverSlug);
  const setActiveSlug = useMapStore((state) => state.setActiveSlug);
  const [view, setView] = useState<'card' | 'table'>('card');

  // cursor 分頁天生只能往後走，要能往前翻頁就得自己記住走過的每一頁的 cursor。
  // cursorsByPage[p] = 「取得第 p 頁」要送出的 cursor；第 1 頁固定是 undefined，
  // 第 p+1 頁的 cursor 要等實際載入第 p 頁、拿到它的 nextCursor 後才知道
  const [page, setPage] = useState(1);
  const [cursorsByPage, setCursorsByPage] = useState<Record<number, string | undefined>>({
    1: undefined,
    2: initialNextCursor ?? undefined,
  });
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  async function goToPage(nextPage: number) {
    const clamped = Math.min(Math.max(nextPage, 1), pageCount);
    if (clamped === page) return;
    // 還沒走過的頁面，cursor 不存在，代表使用者用不到的按鈕（分頁 UI 本來就會 disable 掉這種情況）
    if (!(clamped in cursorsByPage)) return;

    setIsLoadingPage(true);
    try {
      const result = await apiClient.hikes.findAllPaginated(userId, PAGE_SIZE, cursorsByPage[clamped], true);
      setTrails(
        result.items.map((hike) => ({
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
        }))
      );
      setPage(clamped);
      if (result.nextCursor !== null || clamped + 1 <= pageCount) {
        setCursorsByPage((prev) => ({ ...prev, [clamped + 1]: result.nextCursor ?? undefined }));
      }
    } finally {
      setIsLoadingPage(false);
    }
  }

  const isMapFullscreen = fullscreen === 'map';
  const isTableFullscreen = fullscreen === 'table';

  async function saveTrailPatch(slug: string, patch: Partial<EditableTrail>) {
    const saved = await apiClient.hikes.update(Number(slug), patch);
    setTrails((prev) =>
      prev.map((trail) =>
        trail.slug === slug
          ? {
              ...trail,
              name: saved.name,
              county: saved.county ?? '',
              town: saved.town ?? '',
              date: saved.date,
              isPublic: saved.isPublic,
              isHundred: saved.isHundred ?? false,
              isSmallHundred: saved.isSmallHundred ?? false,
              isHundredTrail: saved.isHundredTrail ?? false,
              mountainIds: saved.mountainIds ?? [],
              urls: saved.urls,
              note: saved.note ?? undefined,
            }
          : trail
      )
    );
  }

  async function deleteTrail(slug: string) {
    await apiClient.hikes.remove(Number(slug));
    setTrails((prev) => prev.filter((trail) => trail.slug !== slug));
    if (activeSlug === slug) setActiveSlug(null);
    // 刪除後總數變了，簡單起見重新載入目前這頁
    void goToPage(page);
  }

  return (
    <div className={`flex h-full min-h-0 w-full gap-4 ${isMapFullscreen || isTableFullscreen ? '' : 'flex-col lg:flex-row'}`}>
      {!isMapFullscreen && (
        <div className={`flex min-h-0 w-full flex-col gap-2 ${isTableFullscreen ? '' : 'lg:max-w-md lg:shrink-0'}`}>
          <div className={`rounded-panel flex min-h-0 w-full flex-col gap-2 overflow-hidden lg:h-full`}>
            <TrailExplorerToolbar
              isTableExpanded={isTableFullscreen}
              onToggleTableExpanded={() => onFullscreenChange(isTableFullscreen ? null : 'table')}
              view={view}
              onToggleView={() => setView((prev) => (prev === 'card' ? 'table' : 'card'))}
              isOwner={isOwner}
              isEditMode={isEditMode}
              onToggleEditMode={onToggleEditMode}
            />

            {/* 只有清單捲動，工具列與分頁才會一直留在畫面上 */}
            <div className={`scrollbar-subtle flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto ${isLoadingPage ? 'opacity-50' : ''}`}>
              <TrailExplorerList
                trails={trails}
                view={view}
                activeSlug={activeSlug}
                isEditMode={isEditMode}
                onHoverChange={setHoverSlug}
                onSelect={setActiveSlug}
                onSaveTrailPatch={saveTrailPatch}
                onDeleteTrail={deleteTrail}
              />
            </div>
          </div>
          <TrailListPagination page={page} pageCount={pageCount} onPageChange={goToPage} />
        </div>
      )}

      {!isTableFullscreen && (
        <div className={`relative ${isMapFullscreen ? 'h-125 w-full lg:h-full' : 'h-100 w-full flex-1 lg:h-full'}`}>
          <div className="absolute top-2 right-2 z-1000">
            <ExpandToggleButton
              isExpanded={isMapFullscreen}
              onToggle={() => onFullscreenChange(isMapFullscreen ? null : 'map')}
              label={isMapFullscreen ? t('collapse') : t('expand')}
            />
          </div>
          <TrailsLayer userId={userId} resizeKey={fullscreen} initialViewport={initialViewport ?? undefined} />
        </div>
      )}
    </div>
  );
}
