import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { Link } from '../../../../i18n/navigation';
import { MOCK_RESULTS } from '../../../../testing/mocks/search/search.data';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = MOCK_RESULTS.find((item) => item.type === 'user' && item.username === username);

  if (!user) notFound();

  const t = await getTranslations('ProfilePage');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>{t('title', { username })}</h1>
      <pre className="text-background-contrary text-xs">{JSON.stringify(user, null, 2)}</pre>
      <Link href={`/profile/${username}/data`} className="text-accent">
        {t('goToData')}
      </Link>
      <Link href={`/profile/${username}/hikes/demo-hike`} className="text-accent">
        {t('goToHikeDemo')}
      </Link>
      <Link href={`/profile/${username}/collections`} className="text-accent">
        {t('goToCollections')}
      </Link>
    </div>
  );
}
