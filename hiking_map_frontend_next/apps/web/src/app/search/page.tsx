import Link from 'next/link';

import SearchBar from '../../components/SearchBar';

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1>探索</h1>
      <div className="w-full">
        <SearchBar />
      </div>
      <Link href="/profile/demo" className="text-accent">
        前往個人頁（範例使用者）
      </Link>
      <Link href="/trails/demo-trail" className="text-accent">
        前往路線詳情（範例路線）
      </Link>
    </div>
  );
}
