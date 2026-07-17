import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>首頁</h1>
      <Link href="/profile/demo/hikes/demo-hike" className="text-accent">
        前往健行紀錄詳情（範例）
      </Link>
    </div>
  );
}
