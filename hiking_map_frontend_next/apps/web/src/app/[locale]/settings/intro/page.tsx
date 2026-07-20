import { ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Link } from '../../../../i18n/navigation';

export default function SettingsIntroPage() {
  const t = useTranslations('SettingsIntroPage');

  return (
    <div className="flex w-full flex-col gap-12">
      <Link
        href="/settings"
        className="bg-panel hover:bg-panel-active-lighten flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('backToSettings')}
      </Link>

      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">{t('purposeTitle')}</h2>
        <p className="text-background-contrary/80">{t('purposeIntro')}</p>
        <ul className="text-background-contrary/80 list-disc pl-6">
          <li>{t('purposeItem1')}</li>
          <li>{t('purposeItem2')}</li>
          <li>{t('purposeItem3')}</li>
          <li>{t('purposeItem4')}</li>
          <li>{t('purposeItem5')}</li>
        </ul>
        <p className="text-background-contrary/80">{t('purposeNote')}</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">{t('techTitle')}</h2>
        <p className="text-background-contrary/80">{t('techIntro')}</p>
        <ul className="text-background-contrary/80 list-disc pl-6">
          <li>{t('techFrontend')}</li>
          <li>{t('techBackend')}</li>
          <li>{t('techDesign')}</li>
          <li>{t('techVisual')}</li>
        </ul>
        <Image src="/images/intro-figma.png" alt="Figma" width={1200} height={800} className="rounded-panel w-full" />
        <p className="text-background-contrary/80">{t('techNote')}</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">{t('problemTitle')}</h2>
        <p className="text-background-contrary/80">{t('problemIntro')}</p>
        <p className="text-background-contrary/80">{t('problemMethodsIntro')}</p>
        <ol className="text-background-contrary/80 list-decimal pl-6">
          <li>{t('problemMethod1')}</li>
          <li>{t('problemMethod2')}</li>
          <li>{t('problemMethod3')}</li>
        </ol>
        <Image src="/images/intro-gis.png" alt="GIS" width={1200} height={800} className="rounded-panel w-full" />
        <p className="text-background-contrary/80">{t('problemPainIntro')}</p>
        <ul className="text-background-contrary/80 list-disc pl-6">
          <li>{t('problemPain1')}</li>
          <li>{t('problemPain2')}</li>
          <li>{t('problemPain3')}</li>
        </ul>
        <p className="text-background-contrary/80">{t('problemConclusion')}</p>
      </section>
    </div>
  );
}
