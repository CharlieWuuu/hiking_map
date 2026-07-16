import Link from 'next/link';

export default async function HikeDetailPage({ params }: { params: Promise<{ username: string; hikeId: string }> }) {
  const { username, hikeId } = await params;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>
        健行紀錄詳情 {username} / {hikeId}
      </h1>
      <Link href={`/profile/${username}`} className="text-accent">
        返回個人頁
      </Link>
    </div>
  );
}
