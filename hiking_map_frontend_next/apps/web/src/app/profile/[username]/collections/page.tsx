import Link from 'next/link';

export default async function ProfileCollectionsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>收藏清單 {username}</h1>
      <Link href="/trails/demo-trail" className="text-accent">
        前往路線詳情（範例）
      </Link>
      <Link href={`/profile/${username}`} className="text-accent">
        返回個人頁
      </Link>
    </div>
  );
}
