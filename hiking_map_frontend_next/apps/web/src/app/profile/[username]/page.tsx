import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MOCK_RESULTS } from '../../../testing/mocks/search/search.data';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = MOCK_RESULTS.find((item) => item.type === 'user' && item.username === username);

  if (!user) notFound();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>個人頁 {username}</h1>
      <pre className="text-background-contrary text-xs">{JSON.stringify(user, null, 2)}</pre>
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
