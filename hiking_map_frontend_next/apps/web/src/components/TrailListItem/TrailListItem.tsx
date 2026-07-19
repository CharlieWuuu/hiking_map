import { useTranslations } from 'next-intl';

import { Link } from '../../i18n/navigation';

type Props = {
  username: string;
  slug: string;
  name: string;
  county: string;
  town: string;
  date: string;
  distanceKm: number;
};

export default function TrailListItem({ username, slug, name, county, town, date, distanceKm }: Props) {
  const t = useTranslations('TrailListItem');

  return (
    <Link
      href={`/profile/${username}/hikes/${slug}`}
      className="bg-panel hover:bg-panel-active rounded-panel flex w-full items-center gap-4 p-4 transition-colors duration-150"
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
    </Link>
  );
}
