export default async function ProfileDataPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <h1>資料檢視／編輯 {username}</h1>;
}
