'use client';

import { Download, LayoutGrid, Maximize2, Minimize2, Pencil, Plus, Table, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useRouter } from '../../i18n/navigation';
import MapTrailListItem from '../MapTrailListItem';
import MapTrailTable from '../MapTrailTable';
import TrailsLayer from '../MapView/TrailsLayer';
import TrailEditCard, { type EditableTrail } from '../TrailEditCard';

type Trail = EditableTrail & { path: [number, number][] };

type Props = {
  username: string;
  trails: Trail[];
  fullscreen: 'map' | 'table' | null;
  isEditMode: boolean;
  isOwner: boolean;
};

const EXPORT_FORMATS = ['GeoJSON', 'GPX', 'CSV'] as const;

export default function ProfileTrailExplorer({ username, trails: initialTrails, fullscreen, isEditMode, isOwner }: Props) {
  const t = useTranslations('ProfileDataPage');
  const router = useRouter();
  const [trails, setTrails] = useState(initialTrails);
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [view, setView] = useState<'card' | 'table'>('card');

  const isMapFullscreen = fullscreen === 'map';
  const isTableFullscreen = fullscreen === 'table';

  function setFullscreen(next: 'map' | 'table' | null) {
    router.replace({ pathname: `/profile/${username}/data`, query: next ? { fullscreen: next } : undefined });
  }

  function toggleEditMode() {
    router.replace({ pathname: `/profile/${username}/data`, query: isEditMode ? undefined : { edit: 'true' } });
  }

  function saveTrailPatch(slug: string, patch: Partial<EditableTrail>) {
    setTrails((prev) => prev.map((trail) => (trail.slug === slug ? { ...trail, ...patch } : trail)));
  }

  return (
    <div className={`flex h-full w-full gap-4 ${isMapFullscreen || isTableFullscreen ? '' : 'flex-col lg:flex-row'}`}>
      {!isMapFullscreen && (
        <div className={`flex w-full flex-col gap-2 overflow-y-auto lg:h-full ${isTableFullscreen ? '' : 'lg:max-w-md'}`}>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setFullscreen(isTableFullscreen ? null : 'table')}
              className="text-background-contrary/60 hover:text-background-contrary flex items-center gap-1 text-xs"
            >
              {isTableFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              {isTableFullscreen ? t('collapse') : t('expand')}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView((prev) => (prev === 'card' ? 'table' : 'card'))}
                title={view === 'card' ? t('viewTable') : t('viewCard')}
                className="text-background-contrary/60 hover:text-background-contrary flex items-center gap-1 text-xs"
              >
                {view === 'card' ? <Table className="h-3 w-3" /> : <LayoutGrid className="h-3 w-3" />}
              </button>

              {isOwner && (
                <button
                  type="button"
                  onClick={toggleEditMode}
                  title={isEditMode ? t('exitEdit') : t('goToEdit')}
                  className="bg-panel hover:bg-panel-active rounded-panel flex items-center gap-1 px-2 py-1 text-xs transition-colors"
                >
                  {isEditMode ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                  {isEditMode ? t('exitEdit') : t('goToEdit')}
                </button>
              )}

              {isEditMode && (
                <>
                  <button type="button" className="bg-panel hover:bg-panel-active rounded-panel flex items-center gap-1 px-2 py-1 text-xs transition-colors">
                    <Plus className="h-3 w-3" />
                    {t('addTrail')}
                  </button>
                  <label className="bg-panel hover:bg-panel-active rounded-panel flex cursor-pointer items-center gap-1 px-2 py-1 text-xs transition-colors">
                    <Download className="h-3 w-3" />
                    <select defaultValue="" className="cursor-pointer bg-transparent outline-none">
                      <option value="" disabled>
                        {t('export')}
                      </option>
                      {EXPORT_FORMATS.map((format) => (
                        <option key={format} value={format}>
                          {format}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
            </div>
          </div>

          {trails.length === 0 && <p className="text-background-contrary/60 text-sm">{t('noTrails')}</p>}
          {trails.length > 0 && view === 'table' ? (
            <MapTrailTable
              trails={trails}
              activeSlug={activeSlug}
              onMouseEnter={setHoverSlug}
              onMouseLeave={() => setHoverSlug(null)}
              onSelect={(slug) => setActiveSlug((prev) => (prev === slug ? null : slug))}
              renderEditRow={
                isEditMode
                  ? (slug) => {
                      const trail = trails.find((t) => t.slug === slug);
                      if (!trail) return null;
                      return <TrailEditCard trail={trail} onClose={() => setActiveSlug(null)} onSave={(patch) => saveTrailPatch(trail.slug, patch)} />;
                    }
                  : undefined
              }
            />
          ) : (
            trails.map((trail) =>
              isEditMode && trail.slug === activeSlug ? (
                <TrailEditCard key={trail.slug} trail={trail} onClose={() => setActiveSlug(null)} onSave={(patch) => saveTrailPatch(trail.slug, patch)} />
              ) : (
                <MapTrailListItem
                  key={trail.slug}
                  name={trail.name}
                  county={trail.county}
                  town={trail.town}
                  date={trail.date}
                  distanceKm={trail.distanceKm}
                  isActive={trail.slug === activeSlug}
                  onMouseEnter={() => setHoverSlug(trail.slug)}
                  onMouseLeave={() => setHoverSlug(null)}
                  onClick={() => setActiveSlug((prev) => (prev === trail.slug ? null : trail.slug))}
                />
              )
            )
          )}
        </div>
      )}

      {!isTableFullscreen && (
        <div className={`relative ${isMapFullscreen ? 'h-125 w-full lg:h-full' : 'h-100 w-full flex-1 lg:h-full'}`}>
          <button
            type="button"
            onClick={() => setFullscreen(isMapFullscreen ? null : 'map')}
            className="bg-panel hover:bg-panel-active rounded-panel absolute top-2 right-2 z-1000 flex items-center gap-1 px-2 py-1 text-xs transition-colors"
          >
            {isMapFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            {isMapFullscreen ? t('collapse') : t('expand')}
          </button>
          <TrailsLayer trails={trails} hoverSlug={hoverSlug} activeSlug={activeSlug} onHoverChange={setHoverSlug} onSelect={setActiveSlug} />
        </div>
      )}
    </div>
  );
}
