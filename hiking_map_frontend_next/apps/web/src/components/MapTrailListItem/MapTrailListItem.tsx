'use client';

import { useTranslations } from 'next-intl';

type Props = {
  name: string;
  county: string;
  town: string;
  date: string;
  distanceKm: number;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
};

export default function MapTrailListItem({ name, county, town, date, distanceKm, isActive, onMouseEnter, onMouseLeave, onClick }: Props) {
  const t = useTranslations('TrailListItem');

  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`rounded-panel flex w-full cursor-pointer items-center gap-4 p-4 text-left transition-colors duration-150 ${
        isActive ? 'bg-panel-active' : 'bg-panel hover:bg-panel-active'
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-lg font-bold">{name}</span>
        <span className="text-background-contrary/60 text-sm">
          {county} {town}
        </span>
      </div>

      <div className="bg-panel-active w-0.5 shrink-0 self-stretch" />

      <div className="flex shrink-0 gap-4">
        <div className="flex flex-col items-end">
          <span className="text-background-contrary/60 text-xs">{t('date')}</span>
          <span className="font-bold">{date}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-background-contrary/60 text-xs">{t('distance')}</span>
          <span className="font-bold">{t('distanceValue', { distance: distanceKm })}</span>
        </div>
      </div>
    </button>
  );
}
