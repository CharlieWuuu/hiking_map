export default async function HikeDetailPage({ params }: { params: Promise<{ username: string; hikeId: string }> }) {
  const { username, hikeId } = await params;
  return (
    <h1>
      健行紀錄詳情 {username} / {hikeId}
    </h1>
  );
}
