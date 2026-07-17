import Link from 'next/link';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>個人頁 {username}</h1>
      <Link href={`/profile/${username}/data`} className="text-accent">
        前往資料檢視／編輯
      </Link>
      <Link href={`/profile/${username}/hikes/demo-hike`} className="text-accent">
        前往健行紀錄詳情（範例）
      </Link>
      <Link href={`/profile/${username}/collections`} className="text-accent">
        前往收藏清單
      </Link>
    </div>
  );
}
