'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import TrailsLayer from '../../../../../../components/MapView/TrailsLayer';
import type { EditableTrail } from '../../../../../../components/TrailEditCard';
import ExpandToggleButton from './ExpandToggleButton';
import TrailExplorerList from './TrailExplorerList';
import TrailExplorerToolbar from './TrailExplorerToolbar';

type Trail = EditableTrail & { path: [number, number][] };

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
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [view, setView] = useState<'card' | 'table'>('card');

  const isMapFullscreen = fullscreen === 'map';
  const isTableFullscreen = fullscreen === 'table';

  function saveTrailPatch(slug: string, patch: Partial<EditableTrail>) {
    setTrails((prev) => prev.map((trail) => (trail.slug === slug ? { ...trail, ...patch } : trail)));
  }

  return (
    <div className={`flex h-full w-full gap-4 ${isMapFullscreen || isTableFullscreen ? '' : 'flex-col lg:flex-row'}`}>
      {!isMapFullscreen && (
        <div className={`flex w-full flex-col gap-2 overflow-y-auto lg:h-full ${isTableFullscreen ? '' : 'lg:max-w-md'}`}>
          <TrailExplorerToolbar
            isTableExpanded={isTableFullscreen}
            onToggleTableExpanded={() => onFullscreenChange(isTableFullscreen ? null : 'table')}
            view={view}
            onToggleView={() => setView((prev) => (prev === 'card' ? 'table' : 'card'))}
            isOwner={isOwner}
            isEditMode={isEditMode}
            onToggleEditMode={onToggleEditMode}
          />

          <TrailExplorerList
            trails={trails}
            view={view}
            activeSlug={activeSlug}
            isEditMode={isEditMode}
            onHoverChange={setHoverSlug}
            onSelect={setActiveSlug}
            onSaveTrailPatch={saveTrailPatch}
          />
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
          <TrailsLayer trails={trails} hoverSlug={hoverSlug} activeSlug={activeSlug} onHoverChange={setHoverSlug} onSelect={setActiveSlug} />
        </div>
      )}
    </div>
  );
}
