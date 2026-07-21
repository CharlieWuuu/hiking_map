import { useTranslations } from 'next-intl';

import MapTrailTable from '../../../../../../components/MapTrailTable';
import TrailEditCard, { type EditableTrail } from '../../../../../../components/TrailEditCard';
import TrailListItem from '../../../../../../components/TrailListItem';

type Trail = EditableTrail & { path: [number, number][] };

type Props = {
  trails: Trail[];
  view: 'card' | 'table';
  activeSlug: string | null;
  isEditMode: boolean;
  onHoverChange: (slug: string | null) => void;
  onSelect: (slug: string | null) => void;
  onSaveTrailPatch: (slug: string, patch: Partial<EditableTrail>) => void;
};

export default function TrailExplorerList({ trails, view, activeSlug, isEditMode, onHoverChange, onSelect, onSaveTrailPatch }: Props) {
  const t = useTranslations('ProfileDataPage');

  if (trails.length === 0) {
    return <p className="text-background-contrary/60 text-sm">{t('noTrails')}</p>;
  }

  if (view === 'table') {
    return (
      <MapTrailTable
        trails={trails}
        activeSlug={activeSlug}
        onMouseEnter={onHoverChange}
        onMouseLeave={() => onHoverChange(null)}
        onSelect={(slug) => onSelect(activeSlug === slug ? null : slug)}
        renderEditRow={
          isEditMode
            ? (slug) => {
                const trail = trails.find((item) => item.slug === slug);
                if (!trail) return null;
                return <TrailEditCard trail={trail} onClose={() => onSelect(null)} onSave={(patch) => onSaveTrailPatch(trail.slug, patch)} />;
              }
            : undefined
        }
      />
    );
  }

  return (
    <>
      {trails.map((trail) =>
        isEditMode && trail.slug === activeSlug ? (
          <TrailEditCard key={trail.slug} trail={trail} onClose={() => onSelect(null)} onSave={(patch) => onSaveTrailPatch(trail.slug, patch)} />
        ) : (
          <TrailListItem
            key={trail.slug}
            name={trail.name}
            county={trail.county}
            town={trail.town}
            date={trail.date}
            distanceKm={trail.distanceKm}
            isActive={trail.slug === activeSlug}
            onMouseEnter={() => onHoverChange(trail.slug)}
            onMouseLeave={() => onHoverChange(null)}
            onClick={() => onSelect(activeSlug === trail.slug ? null : trail.slug)}
          />
        )
      )}
    </>
  );
}
