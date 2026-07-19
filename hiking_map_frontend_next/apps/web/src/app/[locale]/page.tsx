import { useTranslations } from 'next-intl';

import AchievementRing from '../../components/AchievementRing';
import BarChart from '../../components/BarChart';
import TrailListItem from '../../components/TrailListItem';
import { Link } from '../../i18n/navigation';
import { MOCK_PROFILE_DETAILS } from '../../testing/mocks/profile/profile.data';
import { MOCK_TRAIL_DETAILS } from '../../testing/mocks/trails/trails.data';

// 暫時用假的登入者 username，之後接上真正登入邏輯後會改成從 session 讀取
const DEMO_LOGGED_IN_USERNAME = 'demo';

export default function Home() {
  const t = useTranslations('HomePage');
  const profile = MOCK_PROFILE_DETAILS.find((item) => item.username === DEMO_LOGGED_IN_USERNAME)!;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12">
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">{t('yourStats')}</h2>
        <div className="flex flex-wrap justify-around gap-4">
          <AchievementRing label={t('achievementHundred')} value={profile.achievements.hundred} />
          <AchievementRing label={t('achievementSmallHundred')} value={profile.achievements.smallHundred} />
          <AchievementRing label={t('achievementHundredTrail')} value={profile.achievements.hundredTrail} />
        </div>
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
        <Link
          href={`/profile/${DEMO_LOGGED_IN_USERNAME}`}
          className="bg-panel hover:bg-panel-active rounded-panel w-fit self-center px-4 py-2 text-sm transition-colors"
        >
          {t('goToProfile')}
        </Link>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">{t('recommendedTrails')}</h2>
        <div className="flex flex-col gap-3">
          {MOCK_TRAIL_DETAILS.map((trail) => (
            <TrailListItem key={trail.slug} {...trail} />
          ))}
        </div>
      </section>
    </div>
  );
}
