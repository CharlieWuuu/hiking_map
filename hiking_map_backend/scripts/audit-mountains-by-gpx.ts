// 用 hiking_map_data 三個資料夾的 GPX 檔名當唯一事實來源，逐一檢查 mountains 表裡
// 每座山的名字，有沒有在對應分類資料夾的任何檔名裡出現過（包含關係，因為路線常橫跨多座山、
// 或以「XX步道」「XX單攻」等後綴命名）。完全沒出現過的山，代表這個系統實際上沒有任何 GPX
// 路線資料涵蓋到它，只是 seed-mountains.ts 從 JSON 清單把它塞進資料庫，未必該留在這個分類。
// 只印報告，不寫入資料庫。
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/audit-mountains-by-gpx.ts

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { readdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(__dirname, '../../hiking_map_data');
const CATEGORY_DIRS: Record<string, string> = {
  百岳: '百岳',
  小百岳: '小百岳',
};

async function main() {
  const dataSource = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await dataSource.initialize();

  for (const [categoryName, dir] of Object.entries(CATEGORY_DIRS)) {
    const files = readdirSync(join(DATA_DIR, dir)).filter((f) => f.toLowerCase().endsWith('.gpx'));
    const filenames = files.map((f) => f.replace(/\.gpx$/i, ''));

    const mountains: { id: number; name: string }[] = await dataSource.query(
      `SELECT m.id, m.name FROM mountains m
       JOIN mountain_category_map mcm ON mcm.mountain_id = m.id
       JOIN categories c ON c.id = mcm.category_id
       WHERE c.name = $1
       ORDER BY m.name`,
      [categoryName],
    );

    const notFound = mountains.filter((m) => !filenames.some((filename) => filename.includes(m.name)));

    console.log(`\n=== ${categoryName}（資料庫 ${mountains.length} 筆，GPX 資料夾 ${filenames.length} 個檔案）===`);
    console.log(`完全沒有任何 GPX 檔名包含山名的（${notFound.length} 筆）：`);
    notFound.forEach((m) => console.log(`  [id=${m.id}] ${m.name}`));
  }

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
