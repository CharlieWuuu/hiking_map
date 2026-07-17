import { getTranslations } from 'next-intl/server';

import { Link } from '../../../../../../i18n/navigation';

export default async function HikeDetailPage({ params }: { params: Promise<{ username: string; hikeId: string }> }) {
  const { username, hikeId } = await params;
  const t = await getTranslations('HikeDetailPage');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>{t('title', { username, hikeId })}</h1>
      <Link href={`/profile/${username}`} className="text-accent">
        {t('backToProfile')}
      </Link>
    </div>
  );
}
