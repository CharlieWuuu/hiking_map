import Link from 'next/link';

export default function SettingsIntroPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>關於本站</h1>
      <Link href="/settings" className="text-accent">
        返回設定
      </Link>
    </div>
  );
}
