import { useTranslations } from 'next-intl';

import { Link } from '../../i18n/navigation';

type Props = {
  href: string;
  name: string;
  county: string;
  town: string;
  date?: string;
  distanceKm?: number;
};

export default function TrailListItem({ href, name, county, town, date, distanceKm }: Props) {
  const t = useTranslations('TrailListItem');
  const hasStats = date !== undefined || distanceKm !== undefined;

  return (
    <Link href={href} className="bg-panel hover:bg-panel-active rounded-panel flex w-full items-center gap-4 p-4 transition-colors duration-150">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-lg font-bold">{name}</span>
        <span className="text-background-contrary/60 text-sm">
          {county} {town}
        </span>
      </div>

      {hasStats && (
        <>
          <div className="bg-panel-active w-0.5 shrink-0 self-stretch" />

          <div className="flex shrink-0 gap-4">
            {date !== undefined && (
              <div className="flex flex-col items-end">
                <span className="text-background-contrary/60 text-xs">{t('date')}</span>
                <span className="font-bold">{date}</span>
              </div>
            )}
            {distanceKm !== undefined && (
              <div className="flex flex-col items-end">
                <span className="text-background-contrary/60 text-xs">{t('distance')}</span>
                <span className="font-bold">{t('distanceValue', { distance: distanceKm })}</span>
              </div>
            )}
          </div>
        </>
      )}
    </Link>
  );
}
