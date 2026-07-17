import Link from 'next/link';

export default function RecordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>記錄</h1>
      <p>之後這裡會先顯示地圖與「開始」按鈕，按下開始才會真正啟動 GPS 記錄</p>
      <Link href="/profile/demo" className="text-accent">
        完成後前往個人頁總覽
      </Link>
    </div>
  );
}
