export default async function ProfileCollectionsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <h1>收藏清單 {username}</h1>;
}
