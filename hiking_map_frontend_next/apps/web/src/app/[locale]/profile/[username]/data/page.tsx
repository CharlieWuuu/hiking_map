import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { Link } from '../../../../../i18n/navigation';
import { MOCK_PROFILE_DETAILS } from '../../../../../testing/mocks/profile/profile.data';
import ProfileTrailExplorerWithNavigation from './_components/ProfileTrailExplorerWithNavigation';

// 暫時用假的登入者 username，之後接上真正登入邏輯後會改成從 session 讀取
const DEMO_LOGGED_IN_USERNAME = 'demo';

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ fullscreen?: string; edit?: string }>;
};

export default async function ProfileDataPage({ params, searchParams }: Props) {
  const { username } = await params;
  const { fullscreen: rawFullscreen, edit } = await searchParams;
  const fullscreen = rawFullscreen === 'map' ? 'map' : rawFullscreen === 'table' ? 'table' : null;
  const isOwner = username === DEMO_LOGGED_IN_USERNAME;
  const isEditMode = edit === 'true' && isOwner;

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
        <ProfileTrailExplorerWithNavigation username={username} trails={profile.trails} fullscreen={fullscreen} isEditMode={isEditMode} isOwner={isOwner} />
      </div>
    </div>
  );
}
