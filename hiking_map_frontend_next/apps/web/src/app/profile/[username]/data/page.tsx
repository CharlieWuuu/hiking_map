import Link from 'next/link';

export default async function ProfileDataPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>資料檢視／編輯 {username}</h1>
      <p>之後這裡會有「上傳既有 GPS 檔案」的入口，補登舊紀錄用</p>
      <Link href={`/profile/${username}`} className="text-accent">
        返回個人頁
      </Link>
    </div>
  );
}
