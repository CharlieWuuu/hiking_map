import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MOCK_RESULTS } from '../../../testing/mocks/search/search.data';

export default async function TrailDetailPage({ params }: { params: Promise<{ trailId: string }> }) {
  const { trailId } = await params;
  const trail = MOCK_RESULTS.find((item) => item.type === 'trail' && item.slug === trailId);

  if (!trail) notFound();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>路線詳情 {trailId}</h1>
      <pre className="text-background-contrary text-xs">{JSON.stringify(trail, null, 2)}</pre>
      <Link href="/trails" className="text-accent">
        返回官方路線圖層
      </Link>
    </div>
  );
}
