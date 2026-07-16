import Link from 'next/link';

export default function TrailsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>官方路線圖層</h1>
      <Link href="/trails/demo-trail" className="text-accent">
        前往路線詳情（範例）
      </Link>
    </div>
  );
}
