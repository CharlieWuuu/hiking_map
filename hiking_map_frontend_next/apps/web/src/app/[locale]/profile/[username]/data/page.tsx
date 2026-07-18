import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import ProfileTrailExplorer from '../../../../../components/ProfileTrailExplorer';
import { Link } from '../../../../../i18n/navigation';
import { MOCK_PROFILE_DETAILS } from '../../../../../testing/mocks/profile/profile.data';

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ fullscreen?: string }>;
};

export default async function ProfileDataPage({ params, searchParams }: Props) {
  const { username } = await params;
  const { fullscreen: rawFullscreen } = await searchParams;
  const fullscreen = rawFullscreen === 'map' ? 'map' : rawFullscreen === 'table' ? 'table' : null;

  const profile = MOCK_PROFILE_DETAILS.find((item) => item.username === username);
  if (!profile) notFound();

  const t = await getTranslations('ProfileDataPage');

  return (
    <div className="flex w-full flex-col gap-4">
      <Link
        href={`/profile/${username}`}
        className="bg-panel hover:bg-panel-active/50 rounded-panel flex w-fit items-center px-3 py-1.5 text-sm transition-colors"
      >
        {t('backToProfile')}
      </Link>
      <div className="h-150">
        <ProfileTrailExplorer username={username} trails={profile.trails} fullscreen={fullscreen} />
      </div>
    </div>
  );
}
