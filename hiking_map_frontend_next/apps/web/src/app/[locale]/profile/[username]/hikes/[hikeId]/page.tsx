import { ChevronLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import TrailMap from '../../../../../../components/TrailMap';
import { Link } from '../../../../../../i18n/navigation';
import { MOCK_PROFILE_DETAILS } from '../../../../../../testing/mocks/profile/profile.data';

export default async function HikeDetailPage({ params }: { params: Promise<{ username: string; hikeId: string }> }) {
  const { username, hikeId } = await params;
  const profile = MOCK_PROFILE_DETAILS.find((item) => item.username === username);
  const hike = profile?.trails.find((trail) => trail.slug === hikeId);

  if (!hike) notFound();

  const t = await getTranslations('HikeDetailPage');

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-16">
      <Link
        href={`/profile/${username}/data`}
        className="bg-panel hover:bg-panel-active-lighten flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('backToProfile')}
      </Link>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold">{hike.name}</h1>
          <p className="text-background-contrary/60 text-lg">
            {hike.county} {hike.town}
          </p>
        </div>

        <div className="flex flex-wrap justify-around gap-4">
          <div className="flex flex-col items-center">
            <span className="text-background-contrary/60 text-xs">{t('date')}</span>
            <p className="text-lg">{hike.date}</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-background-contrary/60 text-xs">{t('distance')}</span>
            <p className="text-lg">{t('distanceValue', { distance: hike.distanceKm })}</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-background-contrary/60 text-xs">{t('links')}</span>
            {hike.urls.length > 0 ? (
              hike.urls.map((url, index) => (
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
            <p className="text-lg">{hike.note ?? t('noValue')}</p>
          </div>
        </div>
      </div>

      <section className="flex flex-col items-start gap-4">
        <h2 className="text-2xl font-bold">{t('map')}</h2>
        <TrailMap path={hike.path} />
      </section>
    </div>
  );
}
