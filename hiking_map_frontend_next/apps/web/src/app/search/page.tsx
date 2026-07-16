import Link from 'next/link';

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>探索</h1>
      <Link href="/profile/demo" className="text-accent">
        前往個人頁（範例使用者）
      </Link>
      <Link href="/trails/demo-trail" className="text-accent">
        前往路線詳情（範例路線）
      </Link>
    </div>
  );
}
