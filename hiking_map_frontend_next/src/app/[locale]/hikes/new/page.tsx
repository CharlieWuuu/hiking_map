import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

import BackLink from '../../../../components/BackLink';
import PageLayout from '../../../../components/PageLayout';
import { getCurrentUser } from '../../../../lib/getCurrentUser';
import GpxUploadForm from './_components/GpxUploadForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewHikePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HikeUploadPage' });

  // 沒登入就沒有地方可以存，先去登入
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect(`/${locale}/login`);

  return (
    <PageLayout title={t('title')} subtitle={t('subtitle')} before={<BackLink href={`/profile/${currentUser.username}`}>{t('backToProfile')}</BackLink>}>
      <GpxUploadForm />
    </PageLayout>
  );
}
