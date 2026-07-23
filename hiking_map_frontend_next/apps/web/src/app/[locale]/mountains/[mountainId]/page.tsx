import { ChevronLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { Link } from '../../../../i18n/navigation';
import { apiClient } from '../../../../lib/apiClient';

export default async function MountainDetailPage({ params }: { params: Promise<{ mountainId: string }> }) {
  const { mountainId } = await params;
  const id = Number(mountainId);
  const mountain = Number.isInteger(id) ? await apiClient.mountains.findOne(id).catch(() => null) : null;

  if (!mountain) notFound();

  const t = await getTranslations('MountainDetailPage');

  return (
    <div className="flex w-full flex-col gap-16">
      <Link
        href="/mountains"
        className="bg-panel hover:bg-panel-active-lighten flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold">{mountain.name}</h1>
        <p className="text-background-contrary/60">{[mountain.range, mountain.county].filter(Boolean).join(' ・ ')}</p>
      </div>

      <div className="flex flex-wrap justify-around gap-4">
        <div className="flex flex-col items-center">
          <span className="text-background-contrary/60 text-xs">{t('elevation')}</span>
          <p className="text-lg">{t('elevationValue', { elevation: mountain.elevationM })}</p>
        </div>
      </div>
    </div>
  );
}
