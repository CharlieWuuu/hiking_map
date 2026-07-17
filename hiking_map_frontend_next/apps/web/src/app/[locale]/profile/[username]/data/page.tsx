import { getTranslations } from 'next-intl/server';

import { Link } from '../../../../../i18n/navigation';

export default async function ProfileDataPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const t = await getTranslations('ProfileDataPage');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>{t('title', { username })}</h1>
      <p>{t('description')}</p>
      <Link href={`/profile/${username}`} className="text-accent">
        {t('backToProfile')}
      </Link>
    </div>
  );
}
