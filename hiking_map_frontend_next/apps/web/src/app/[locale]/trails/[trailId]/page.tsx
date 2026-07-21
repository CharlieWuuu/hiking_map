import { ChevronLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import TrailLayer from '../../../../components/MapView/TrailLayer';
import { Link } from '../../../../i18n/navigation';
import { MOCK_TRAIL_DETAILS } from '../../../../testing/mocks/trails/trails.data';

export default async function TrailDetailPage({ params }: { params: Promise<{ trailId: string }> }) {
  const { trailId } = await params;
  const trail = MOCK_TRAIL_DETAILS.find((item) => item.slug === trailId);

  if (!trail) notFound();

  const t = await getTranslations('TrailDetailPage');

  return (
    <div className="flex w-full flex-col gap-16">
      <Link href="/search" className="bg-panel hover:bg-panel-active-lighten flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors">
        <ChevronLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold">{trail.name}</h1>
          <p className="text-background-contrary/60 text-lg">
            {trail.county} {trail.town}
          </p>
        </div>

        <div className="flex flex-wrap justify-around gap-4">
          <div className="flex flex-col items-center">
            <span className="text-background-contrary/60 text-xs">{t('date')}</span>
            <p className="text-lg">{trail.date}</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-background-contrary/60 text-xs">{t('distance')}</span>
            <p className="text-lg">{t('distanceValue', { distance: trail.distanceKm })}</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-background-contrary/60 text-xs">{t('links')}</span>
            {trail.urls.length > 0 ? (
              trail.urls.map((url, index) => (
                <a key={url} href={url} target="_blank" rel="noreferrer" className="text-accent block text-lg">
                  {t('linkLabel', { index: index + 1 })}
                </a>
              ))
            ) : (
              <p className="text-lg">{t('noValue')}</p>
            )}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-background-contrary/60 text-xs">{t('note')}</span>
            <p className="text-lg">{trail.note ?? t('noValue')}</p>
          </div>
        </div>
      </div>

      {trail.description && (
        <section className="flex flex-col items-start gap-4">
          <h2 className="text-2xl font-bold">{t('intro')}</h2>
          <p className="text-background-contrary/80">{trail.description}</p>
        </section>
      )}

      <section className="flex flex-col items-start gap-4">
        <h2 className="text-2xl font-bold">{t('map')}</h2>
        <TrailLayer path={trail.path} />
      </section>
    </div>
  );
}
