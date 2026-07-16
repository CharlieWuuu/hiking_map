export default async function TrailDetailPage({ params }: { params: Promise<{ trailId: string }> }) {
  const { trailId } = await params;
  return <h1>路線詳情 {trailId}</h1>;
}
