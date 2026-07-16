import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>登入</h1>
      <Link href="/profile/demo" className="text-accent">
        登入後前往個人頁（暫時）
      </Link>
    </div>
  );
}
