import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>找不到這個頁面</h1>
      <p className="text-background-contrary/60 text-sm">可能是網址打錯，或這筆資料不存在</p>
      <Link href="/" className="text-accent">
        回首頁
      </Link>
    </div>
  );
}
