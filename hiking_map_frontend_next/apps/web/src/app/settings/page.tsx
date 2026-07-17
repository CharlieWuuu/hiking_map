import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>設定</h1>
      <Link href="/settings/intro" className="text-accent">
        前往關於本站
      </Link>
    </div>
  );
}
