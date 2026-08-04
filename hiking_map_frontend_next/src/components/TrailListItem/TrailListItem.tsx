import { Map } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '../../i18n/navigation';

type DisplayProps = {
  name: string;
  county: string;
  town: string;
  date?: string;
  distanceKm?: number;
  coverImageUrl?: string | null;
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

function TrailThumbnail({ coverImageUrl }: { coverImageUrl?: string | null }) {
  if (coverImageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={coverImageUrl} alt="" className="h-20 w-20 shrink-0 object-cover" />;
  }

  return (
    <span className="bg-panel-active flex h-20 w-20 shrink-0 items-center justify-center">
      <Map className="text-background-contrary/60 h-8 w-8" />
    </span>
  );
}

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
      <Link
        href={props.href}
        className="bg-panel hover:bg-panel-active rounded-panel relative flex w-full items-stretch gap-4 overflow-hidden transition-colors duration-150"
      >
        <TrailThumbnail coverImageUrl={props.coverImageUrl} />
        <div className="flex min-w-0 flex-1 items-center gap-4 py-4 pr-4">
          <TrailListItemContent {...props} />
        </div>
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
      className={`rounded-panel relative flex w-full cursor-pointer items-stretch gap-4 overflow-hidden text-left transition-colors duration-150 ${
        isActive ? 'bg-panel-active' : 'bg-panel hover:bg-panel-active'
      }`}
    >
      <TrailThumbnail coverImageUrl={props.coverImageUrl} />
      <div className="flex min-w-0 flex-1 items-center gap-4 py-4 pr-4">
        <TrailListItemContent {...props} />
      </div>
    </button>
  );
}
