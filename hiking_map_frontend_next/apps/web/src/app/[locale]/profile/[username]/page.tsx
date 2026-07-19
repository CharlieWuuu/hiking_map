import { CircleUserRound } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import AchievementRing from '../../../../components/AchievementRing';
import BarChart from '../../../../components/BarChart';
import TrailListItem from '../../../../components/TrailListItem';
import { Link } from '../../../../i18n/navigation';
import { MOCK_PROFILE_DETAILS } from '../../../../testing/mocks/profile/profile.data';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = MOCK_PROFILE_DETAILS.find((item) => item.username === username);

  if (!profile) notFound();

  const t = await getTranslations('ProfilePage');

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12">
      {/* 個人資訊 */}
      <div className="flex items-center gap-8">
        {profile.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar} alt="" className="border-accent rounded-panel h-30 w-30 shrink-0 border-4 object-cover" />
        ) : (
          <span className="bg-panel-active border-accent rounded-panel flex h-30 w-30 shrink-0 items-center justify-center border-4">
            <CircleUserRound className="text-background-contrary/60 h-16 w-16" />
          </span>
        )}
        <div className="flex flex-col gap-2">
          <h1 className="text-accent text-3xl font-bold">{profile.displayName}</h1>
          <div className="flex flex-wrap gap-4 text-lg">
            <span>{profile.level}</span>
            <span>{t('totalDistance', { distance: profile.totalDistanceKm })}</span>
            <span>{t('hikeCount', { count: profile.hikeCount })}</span>
          </div>
        </div>
      </div>

      {/* 成就 */}
      <div className="flex flex-wrap justify-around gap-4">
        <AchievementRing label={t('achievementHundred')} value={profile.achievements.hundred} />
        <AchievementRing label={t('achievementSmallHundred')} value={profile.achievements.smallHundred} />
        <AchievementRing label={t('achievementHundredTrail')} value={profile.achievements.hundredTrail} />
      </div>

      {/* 統計圖表 */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-panel rounded-panel flex h-50 min-w-75 flex-1 flex-col gap-4 p-4">
          <span className="text-background-contrary/60 text-sm">{t('monthlyDistance')}</span>
          <BarChart data={profile.monthlyDistance.map((d) => ({ label: d.month.slice(5), value: d.distanceKm }))} />
        </div>
        <div className="bg-panel rounded-panel flex h-50 min-w-75 flex-1 flex-col gap-4 p-4">
          <span className="text-background-contrary/60 text-sm">{t('countyStats')}</span>
          <BarChart data={profile.countyStats.map((d) => ({ label: d.county, value: d.count }))} />
        </div>
      </div>

      {/* 地圖／表格導覽 */}
      <div className="flex gap-4">
        <Link href={`/profile/${username}/data`} className="bg-panel hover:bg-panel-active rounded-panel flex-1 py-4 text-center text-lg transition-colors">
          {t('goToData')}
        </Link>
        <Link
          href={`/profile/${username}/collections`}
          className="bg-panel hover:bg-panel-active rounded-panel flex-1 py-4 text-center text-lg transition-colors"
        >
          {t('goToCollections')}
        </Link>
      </div>

      {/* 歷次軌跡 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">{t('trailHistory')}</h2>
        <div className="flex flex-col gap-3">
          {profile.trails.map((trail) => (
            <TrailListItem key={trail.slug} username={username} {...trail} />
          ))}
        </div>
      </section>
    </div>
  );
}
