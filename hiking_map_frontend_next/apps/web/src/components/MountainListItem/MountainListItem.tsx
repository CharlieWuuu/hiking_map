import { useTranslations } from 'next-intl';

import { Link } from '../../i18n/navigation';

type Props = {
  href: string;
  name: string;
  elevationM: number;
  range: string | null;
  county: string | null;
};

export default function MountainListItem({ href, name, elevationM, range, county }: Props) {
  const t = useTranslations('MountainListItem');

  return (
    <Link href={href} className="bg-panel hover:bg-panel-active rounded-panel flex w-full items-center gap-4 p-4 transition-colors duration-150">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-lg font-bold">{name}</span>
        <span className="text-background-contrary/60 text-sm">{[range, county].filter(Boolean).join(' ・ ')}</span>
      </div>

      <div className="flex shrink-0 flex-col items-end">
        <span className="text-background-contrary/60 text-xs">{t('elevation')}</span>
        <span className="font-bold">{t('elevationValue', { elevation: elevationM })}</span>
      </div>
    </Link>
  );
}
