// 補齊「百岳」路線缺少的兩層關聯：
// 1. trail_category_map：把百岳資料夾匯入的 126 筆未分類 trails 打上「百岳」分類
// 2. trail_mountains：依 台灣百岳.json 裡每座山 related_trials[].name 對照 trails.name，建立路線-山關聯
// import-trails.ts 當初只寫了 trails/trail_geometries，這兩張關聯表從未被建立過。
// 一次性腳本，可重複執行（用 ON CONFLICT DO NOTHING）。
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/link-hundred-peaks-trails.ts

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';

type RawMountain = {
  id: string;
  title: string;
  related_trials?: { name: string; link: string }[];
};

const DATA_DIR = join(__dirname, '../../hiking_map_data');
const CATEGORY_NAME = '百岳';

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await dataSource.initialize();

  const categoryRows = await dataSource.query(`SELECT id FROM categories WHERE name = $1`, [CATEGORY_NAME]);
  if (!categoryRows.length) throw new Error(`找不到分類：${CATEGORY_NAME}`);
  const categoryId = categoryRows[0].id;

  // Step 1：把「百岳」資料夾匯入、目前完全沒有分類標籤的 trails 全部打上「百岳」分類
  const uncategorizedTrails: { id: number; name: string }[] = await dataSource.query(
    `SELECT t.id, t.name FROM trails t WHERE t.id NOT IN (SELECT trail_id FROM trail_category_map)`,
  );

  let categorized = 0;
  for (const trail of uncategorizedTrails) {
    await dataSource.query(`INSERT INTO trail_category_map (trail_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [trail.id, categoryId]);
    categorized++;
  }
  console.log(`Step 1 完成：${categorized} 條路線已標記為「百岳」分類`);

  // Step 2：依 json 的 related_trials[].name 對照 trails.name，建立 trail_mountains 關聯
  const mountains: RawMountain[] = JSON.parse(readFileSync(join(DATA_DIR, '台灣百岳.json'), 'utf-8'));

  const allTrails: { id: number; name: string }[] = await dataSource.query(`SELECT id, name FROM trails`);
  const trailByName = new Map(allTrails.map((t) => [t.name, t.id]));

  const mountainRows: { id: number; name: string }[] = await dataSource.query(
    `SELECT m.id, m.name FROM mountains m
     JOIN mountain_category_map mcm ON mcm.mountain_id = m.id
     WHERE mcm.category_id = $1`,
    [categoryId],
  );
  const mountainByName = new Map(mountainRows.map((m) => [m.name, m.id]));

  let linked = 0;
  const unmatchedTrailNames: string[] = [];
  const unmatchedMountainNames: string[] = [];

  for (const mountain of mountains) {
    const mountainId = mountainByName.get(mountain.title);
    if (!mountainId) {
      unmatchedMountainNames.push(mountain.title);
      continue;
    }

    for (const trial of mountain.related_trials ?? []) {
      // 先試完全比對；比對不到再用「包含」比對（json 名稱常帶括號附註，如「八大秀(八通關山、大水窟山、秀姑巒山)」，
      // 資料庫裡的路線名稱通常只有前半段「八大秀」），只在唯一命中時才採用，避免誤配
      let trailId = trailByName.get(trial.name);
      if (!trailId) {
        const candidates = allTrails.filter((t) => trial.name.includes(t.name) || t.name.includes(trial.name));
        if (candidates.length === 1) trailId = candidates[0].id;
      }
      if (!trailId) {
        unmatchedTrailNames.push(`${mountain.title} -> ${trial.name}`);
        continue;
      }
      await dataSource.query(`INSERT INTO trail_mountains (trail_id, mountain_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [trailId, mountainId]);
      linked++;
    }
  }

  console.log(`Step 2 完成：建立 ${linked} 筆 trail_mountains 關聯`);
  if (unmatchedMountainNames.length) {
    console.log(`\n找不到對應 mountains 記錄的山名（${unmatchedMountainNames.length} 筆）：`);
    unmatchedMountainNames.forEach((n) => console.log(`  - ${n}`));
  }
  if (unmatchedTrailNames.length) {
    console.log(`\n找不到對應 trails 記錄的路線名（${unmatchedTrailNames.length} 筆，json 有列但資料庫沒有這個名字的 trail，可能是還沒匯入或名稱不完全一致）：`);
    unmatchedTrailNames.forEach((n) => console.log(`  - ${n}`));
  }

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
