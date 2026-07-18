'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import MapTrailListItem from '../MapTrailListItem';
import MultiTrailMap from '../MultiTrailMap';

type Trail = {
  slug: string;
  name: string;
  county: string;
  town: string;
  date: string;
  distanceKm: number;
  path: [number, number][];
};

type Props = {
  trails: Trail[];
  mode: 'map' | 'data';
};

export default function ProfileTrailExplorer({ trails, mode }: Props) {
  const t = useTranslations('ProfileDataPage');
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const isMapMode = mode === 'map';

  return (
    <div className={`flex h-full w-full gap-4 ${isMapMode ? '' : 'flex-col lg:flex-row'}`}>
      {!isMapMode && (
        <div className="flex w-full flex-col gap-2 overflow-y-auto lg:h-full lg:max-w-md">
          {trails.length === 0 && <p className="text-background-contrary/60 text-sm">{t('noTrails')}</p>}
          {trails.map((trail) => (
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
          ))}
        </div>
      )}

      <div className={isMapMode ? 'h-125 w-full lg:h-full' : 'h-100 w-full flex-1 lg:h-full'}>
        <MultiTrailMap trails={trails} hoverSlug={hoverSlug} activeSlug={activeSlug} onHoverChange={setHoverSlug} onSelect={setActiveSlug} />
      </div>
    </div>
  );
}
