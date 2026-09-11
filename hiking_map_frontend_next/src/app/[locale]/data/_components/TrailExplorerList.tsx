import { useTranslations } from 'next-intl';

import TrailEditCard, { type EditableTrail } from '../../../../components/TrailEditCard';
import TrailListItem from '../../../../components/TrailListItem';
import TrailTable from '../../../../components/TrailTable';

type Trail = EditableTrail & { path: [number, number][]; bbox?: [number, number, number, number] | null };

// 只標最具代表性的成就，避免一張卡片被標籤塞滿；不公開路線額外提示，因為只有本人看得到
function trailBadges(trail: Trail, t: ReturnType<typeof useTranslations<'ProfileDataPage'>>) {
  const badges: { label: string; tone?: 'accent' | 'neutral' }[] = [];
  if (trail.isHundred) badges.push({ label: t('badgeHundred') });
  else if (trail.isSmallHundred) badges.push({ label: t('badgeSmallHundred') });
  else if (trail.isHundredTrail) badges.push({ label: t('badgeHundredTrail') });
  if (!trail.isPublic) badges.push({ label: t('badgePrivate'), tone: 'neutral' });
  return badges;
}

type Props = {
  trails: Trail[];
  view: 'card' | 'table';
  activeSlug: string | null;
  isEditMode: boolean;
  onHoverChange: (slug: string | null) => void;
  onSelect: (slug: string | null, bbox?: [number, number, number, number] | null) => void;
  onSaveTrailPatch: (slug: string, patch: Partial<EditableTrail>) => void | Promise<void>;
  onDeleteTrail: (slug: string) => void;
};

export default function TrailExplorerList({ trails, view, activeSlug, isEditMode, onHoverChange, onSelect, onSaveTrailPatch, onDeleteTrail }: Props) {
  const t = useTranslations('ProfileDataPage');

  if (trails.length === 0) {
    return <p className="text-background-contrary/60 text-sm">{t('noTrails')}</p>;
  }

  if (view === 'table') {
    return (
      <TrailTable
        trails={trails}
        activeSlug={activeSlug}
        onMouseEnter={onHoverChange}
        onMouseLeave={() => onHoverChange(null)}
        onSelect={(slug) => {
          const trail = trails.find((item) => item.slug === slug);
          onSelect(activeSlug === slug ? null : slug, trail?.bbox);
        }}
        renderEditRow={
          isEditMode
            ? (slug) => {
                const trail = trails.find((item) => item.slug === slug);
                if (!trail) return null;
                return (
                  <TrailEditCard
                    trail={trail}
                    onClose={() => onSelect(null)}
                    onSave={(patch) => onSaveTrailPatch(trail.slug, patch)}
                    onDelete={() => onDeleteTrail(trail.slug)}
                  />
                );
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
          <TrailEditCard
            key={trail.slug}
            trail={trail}
            onClose={() => onSelect(null)}
            onSave={(patch) => onSaveTrailPatch(trail.slug, patch)}
            onDelete={() => onDeleteTrail(trail.slug)}
          />
        ) : (
          <TrailListItem
            key={trail.slug}
            name={trail.name}
            county={trail.county}
            town={trail.town}
            date={trail.date}
            distanceKm={trail.distanceKm}
            badges={trailBadges(trail, t)}
            isActive={trail.slug === activeSlug}
            onMouseEnter={() => onHoverChange(trail.slug)}
            onMouseLeave={() => onHoverChange(null)}
            onClick={() => onSelect(activeSlug === trail.slug ? null : trail.slug, trail.bbox)}
          />
        )
      )}
    </>
  );
}
