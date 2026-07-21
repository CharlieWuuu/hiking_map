import { useTranslations } from 'next-intl';

import { Link } from '../../i18n/navigation';

type DisplayProps = {
  name: string;
  county: string;
  town: string;
  date?: string;
  distanceKm?: number;
};

type NavigationProps = DisplayProps & {
  href: string;
  onMouseEnter?: never;
  onMouseLeave?: never;
  onClick?: never;
  isActive?: never;
};

type InteractiveProps = DisplayProps & {
  href?: never;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  isActive: boolean;
};

type Props = NavigationProps | InteractiveProps;

function TrailListItemContent({ name, county, town, date, distanceKm }: DisplayProps) {
  const t = useTranslations('TrailListItem');
  const hasStats = date !== undefined || distanceKm !== undefined;

  return (
    <>
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
    </>
  );
}

export default function TrailListItem(props: Props) {
  if (props.href !== undefined) {
    return (
      <Link href={props.href} className="bg-panel hover:bg-panel-active rounded-panel flex w-full items-center gap-4 p-4 transition-colors duration-150">
        <TrailListItemContent {...props} />
      </Link>
    );
  }

  const { isActive, onMouseEnter, onMouseLeave, onClick } = props;

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
      <TrailListItemContent {...props} />
    </button>
  );
}
