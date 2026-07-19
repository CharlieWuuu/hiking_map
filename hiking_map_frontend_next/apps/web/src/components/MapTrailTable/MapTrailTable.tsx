'use client';

import { useTranslations } from 'next-intl';

type Trail = {
  slug: string;
  name: string;
  county: string;
  town: string;
  date: string;
};

type Props = {
  trails: Trail[];
  activeSlug: string | null;
  onMouseEnter: (slug: string) => void;
  onMouseLeave: () => void;
  onSelect: (slug: string) => void;
};

export default function MapTrailTable({ trails, activeSlug, onMouseEnter, onMouseLeave, onSelect }: Props) {
  const t = useTranslations('MapTrailTable');

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-background-contrary/60 border-b-panel-active border-b text-left">
          <th className="w-10 py-2 font-normal">#</th>
          <th className="py-2 font-normal">{t('name')}</th>
          <th className="py-2 font-normal">{t('county')}</th>
          <th className="py-2 font-normal">{t('town')}</th>
          <th className="py-2 font-normal">{t('date')}</th>
        </tr>
      </thead>
      <tbody>
        {trails.map((trail, index) => (
          <tr
            key={trail.slug}
            onMouseEnter={() => onMouseEnter(trail.slug)}
            onMouseLeave={onMouseLeave}
            onClick={() => onSelect(trail.slug)}
            className={`hover:bg-panel-active/50 cursor-pointer transition-colors duration-150 ${trail.slug === activeSlug ? 'bg-panel-active' : ''}`}
          >
            <td className="py-2">{index + 1}</td>
            <td className="py-2 font-bold">{trail.name}</td>
            <td className="py-2">{trail.county}</td>
            <td className="py-2">{trail.town}</td>
            <td className="py-2">{trail.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
