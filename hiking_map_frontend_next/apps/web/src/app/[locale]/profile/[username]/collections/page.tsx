import { getTranslations } from 'next-intl/server';

import { Link } from '../../../../../i18n/navigation';

export default async function ProfileCollectionsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const t = await getTranslations('ProfileCollectionsPage');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>{t('title', { username })}</h1>
      <Link href="/trails/demo-trail" className="text-accent">
        {t('goToDemoTrail')}
      </Link>
      <Link href={`/profile/${username}`} className="text-accent">
        {t('backToProfile')}
      </Link>
    </div>
  );
}
