import Link from 'next/link';

export default async function TrailDetailPage({ params }: { params: Promise<{ trailId: string }> }) {
  const { trailId } = await params;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>路線詳情 {trailId}</h1>
      <Link href="/trails" className="text-accent">
        返回官方路線圖層
      </Link>
    </div>
  );
}
