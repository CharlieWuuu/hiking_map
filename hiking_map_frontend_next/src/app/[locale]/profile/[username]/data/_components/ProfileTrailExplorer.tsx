'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import TrailsLayer, { type MapTrail } from '../../../../../../components/MapView/TrailsLayer';
import type { EditableTrail } from '../../../../../../components/TrailEditCard';
import { apiClient } from '../../../../../../lib/apiClient';
import { useMapStore } from '../../../../../../lib/mapStore';
import ExpandToggleButton from './ExpandToggleButton';
import TrailExplorerList from './TrailExplorerList';
import TrailExplorerToolbar from './TrailExplorerToolbar';
import TrailListPagination from './TrailListPagination';

type Trail = EditableTrail & Pick<MapTrail, 'path' | 'trackUrl' | 'bbox'>;

const PAGE_SIZE = 20;

type Props = {
  trails: Trail[];
  fullscreen: 'map' | 'table' | null;
  isEditMode: boolean;
  isOwner: boolean;
  onFullscreenChange: (next: 'map' | 'table' | null) => void;
  onToggleEditMode: () => void;
};

export default function ProfileTrailExplorer({ trails: initialTrails, fullscreen, isEditMode, isOwner, onFullscreenChange, onToggleEditMode }: Props) {
  const t = useTranslations('ProfileDataPage');
  const [trails, setTrails] = useState(initialTrails);
  // hover/選取狀態放在 map store，清單與地圖不必再靠 props 互相轉發
  const activeSlug = useMapStore((state) => state.activeSlug);
  const setHoverSlug = useMapStore((state) => state.setHoverSlug);
  const setActiveSlug = useMapStore((state) => state.setActiveSlug);
  const [view, setView] = useState<'card' | 'table'>('card');
  const [page, setPage] = useState(1);

  const isMapFullscreen = fullscreen === 'map';
  const isTableFullscreen = fullscreen === 'table';
  const pageCount = Math.max(1, Math.ceil(trails.length / PAGE_SIZE));
  const pagedTrails = trails.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function saveTrailPatch(slug: string, patch: Partial<EditableTrail>) {
    setTrails((prev) => prev.map((trail) => (trail.slug === slug ? { ...trail, ...patch } : trail)));
  }

  async function deleteTrail(slug: string) {
    await apiClient.hikes.remove(Number(slug));
    setTrails((prev) => prev.filter((trail) => trail.slug !== slug));
    if (activeSlug === slug) setActiveSlug(null);
    setPage((prev) => Math.min(prev, Math.max(1, Math.ceil((trails.length - 1) / PAGE_SIZE))));
  }

  function changePage(next: number) {
    setPage(Math.min(Math.max(next, 1), pageCount));
  }

  return (
    <div className={`flex h-full w-full gap-4 ${isMapFullscreen || isTableFullscreen ? '' : 'flex-col lg:flex-row'}`}>
      {!isMapFullscreen && (
        <div className={`flex w-full flex-col gap-2 lg:h-full ${isTableFullscreen ? '' : 'lg:max-w-md'}`}>
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
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            <TrailExplorerList
              trails={pagedTrails}
              view={view}
              activeSlug={activeSlug}
              isEditMode={isEditMode}
              onHoverChange={setHoverSlug}
              onSelect={setActiveSlug}
              onSaveTrailPatch={saveTrailPatch}
              onDeleteTrail={deleteTrail}
            />
          </div>

          <TrailListPagination page={page} pageCount={pageCount} onPageChange={changePage} />
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
          <TrailsLayer trails={trails} />
        </div>
      )}
    </div>
  );
}
