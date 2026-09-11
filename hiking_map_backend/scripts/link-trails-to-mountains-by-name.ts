// 重建 trail_mountains（路線↔山關聯）。JSON 清單（台灣百岳.json/台灣小百岳.json）已不存在，
// 改用純粹字串比對：一條路線的名稱裡如果包含某座山的名字，就視為這條路線通往那座山。
// 粗略作法，會漏掉像「馬博橫斷」這種縱走路線名稱不含具體山名的情況，但沒有更好的資料來源可用。
// 只處理百岳、小百岳（百大必訪步道是路線層級分類，跟山無關）。
// 一次性腳本，可重複執行（用 ON CONFLICT DO NOTHING）。
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/link-trails-to-mountains-by-name.ts

import 'dotenv/config';
import { DataSource } from 'typeorm';

const CATEGORY_NAMES = ['百岳', '小百岳'];

async function main() {
  const dataSource = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await dataSource.initialize();

  let totalLinked = 0;

  for (const categoryName of CATEGORY_NAMES) {
    const categoryRows = await dataSource.query(`SELECT id FROM categories WHERE name = $1`, [categoryName]);
    if (!categoryRows.length) throw new Error(`找不到分類：${categoryName}`);
    const categoryId = categoryRows[0].id;

    const mountains: { id: number; name: string }[] = await dataSource.query(
      `SELECT m.id, m.name FROM mountains m
       JOIN mountain_category_map mcm ON mcm.mountain_id = m.id
       WHERE mcm.category_id = $1`,
      [categoryId],
    );

    const trails: { id: number; name: string }[] = await dataSource.query(
      `SELECT t.id, t.name FROM trails t
       JOIN trail_category_map tcm ON tcm.trail_id = t.id
       WHERE tcm.category_id = $1`,
      [categoryId],
    );

    let linked = 0;
    for (const mountain of mountains) {
      const matchedTrails = trails.filter((t) => t.name.includes(mountain.name));
      for (const trail of matchedTrails) {
        await dataSource.query(`INSERT INTO trail_mountains (trail_id, mountain_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
          trail.id,
          mountain.id,
        ]);
        linked++;
      }
    }

    console.log(`${categoryName}：${mountains.length} 座山、${trails.length} 條路線，建立 ${linked} 筆關聯`);
    totalLinked += linked;
  }

  console.log(`\n完成，總共建立 ${totalLinked} 筆 trail_mountains 關聯`);

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
