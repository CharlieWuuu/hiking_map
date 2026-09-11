// 把 demo 帳號的健行紀錄，依名稱模糊比對山頭清單，補上 mountain_ids，
// 讓百岳/小百岳完成度統計能顯示出東西。
// 一次性腳本，透過本機 API（連正式資料庫）更新。
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/link-demo-hike-mountains.ts

import 'dotenv/config';

const API_BASE = 'http://localhost:3001';
const DEMO_USERNAME = 'demo';
const DEMO_PASSWORD = 'demo1234';
const DEMO_USER_ID = 7;

async function main() {
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: DEMO_USERNAME, password: DEMO_PASSWORD }),
  });
  if (!loginRes.ok) throw new Error(`登入失敗: ${await loginRes.text()}`);
  const { token } = await loginRes.json();
  const authHeaders = { Authorization: `Bearer ${token}` };

  const mountains: { id: number; name: string }[] = await (await fetch(`${API_BASE}/mountains`)).json();
  const hikes: { id: number; name: string; mountain_ids: number[] }[] = await (
    await fetch(`${API_BASE}/hikes?userId=${DEMO_USER_ID}`, { headers: authHeaders })
  ).json();

  let updated = 0;
  let matchedZero = 0;

  for (const hike of hikes) {
    const matches = mountains.filter((m) => hike.name.includes(m.name));
    if (matches.length === 0) {
      matchedZero++;
      continue;
    }

    const mountainIds = matches.map((m) => m.id);
    const alreadySet = new Set(hike.mountain_ids ?? []);
    const same = mountainIds.length === alreadySet.size && mountainIds.every((id) => alreadySet.has(id));
    if (same) continue;

    const res = await fetch(`${API_BASE}/hikes/${hike.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ mountain_ids: mountainIds }),
    });
    if (!res.ok) {
      console.error(`更新失敗 ${hike.name}: ${res.status} ${await res.text()}`);
      continue;
    }
    updated++;
    console.log(`${hike.name} -> ${matches.map((m) => m.name).join('、')}`);
  }

  console.log(`更新 ${updated} 筆，無比對到山頭 ${matchedZero} 筆，共 ${hikes.length} 筆`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
