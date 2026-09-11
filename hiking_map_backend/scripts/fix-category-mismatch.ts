// 修正 link-hundred-peaks-trails.ts 造成的分類誤判：把「未分類就一律當百岳」的假設用到了
// 實際上來自小百岳資料夾、但當時也還沒分類的路線上。audit-category-mismatch.ts 已確認 43 筆
// 全部是「應該是小百岳、卻被標成百岳」，這裡把它們的 trail_category_map 從百岳改成小百岳。
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/fix-category-mismatch.ts

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { readdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(__dirname, '../../hiking_map_data');
const CATEGORY_DIRS: Record<string, string> = {
  百岳: '百岳',
  小百岳: '小百岳',
  百大必訪步道: '百大步道',
};

function cleanName(filename: string): string {
  const withoutExt = filename.replace(/\.gpx$/i, '');
  return withoutExt
    .replace(/^\d{4}[-._]?\d{2}[-._]?\d{2}[\s_-]*/, '')
    .replace(/^\d{4}[-._]?\d{2}[-._]?\d{2}[\s_-]*\d{2}[:：]\d{2}[\s_-]*/, '')
    .replace(/[-_\s]*\d{8}[-_]\d{2}$/, '')
    .trim();
}

async function main() {
  const dataSource = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await dataSource.initialize();

  const nameToExpectedCategories = new Map<string, Set<string>>();
  for (const [categoryName, dir] of Object.entries(CATEGORY_DIRS)) {
    const files = readdirSync(join(DATA_DIR, dir)).filter((f) => f.toLowerCase().endsWith('.gpx'));
    for (const file of files) {
      const name = cleanName(file);
      if (!nameToExpectedCategories.has(name)) nameToExpectedCategories.set(name, new Set());
      nameToExpectedCategories.get(name)!.add(categoryName);
    }
  }

  const categoryRows: { id: number; name: string }[] = await dataSource.query(`SELECT id, name FROM categories`);
  const categoryIdByName = new Map(categoryRows.map((c) => [c.name, c.id]));

  const rows: { trail_id: number; name: string; category_id: number; category_name: string }[] = await dataSource.query(
    `SELECT t.id AS trail_id, t.name, tcm.category_id, c.name AS category_name
     FROM trails t
     JOIN trail_category_map tcm ON tcm.trail_id = t.id
     JOIN categories c ON c.id = tcm.category_id
     ORDER BY t.id`,
  );

  let fixed = 0;
  let skippedAmbiguous = 0;

  for (const row of rows) {
    const expected = nameToExpectedCategories.get(row.name);
    if (!expected || expected.has(row.category_name)) continue;

    // 只處理「資料夾來源明確唯一」的情況，避免誤判同名但實際不同來源的路線
    if (expected.size !== 1) {
      console.log(`跳過（來源不唯一）：[id=${row.trail_id}] ${row.name} — 候選：${[...expected].join('、')}`);
      skippedAmbiguous++;
      continue;
    }

    const correctCategoryName = [...expected][0];
    const correctCategoryId = categoryIdByName.get(correctCategoryName);
    if (!correctCategoryId) continue;

    await dataSource.query(`UPDATE trail_category_map SET category_id = $1 WHERE trail_id = $2 AND category_id = $3`, [
      correctCategoryId,
      row.trail_id,
      row.category_id,
    ]);
    fixed++;
  }

  console.log(`\n修正完成：${fixed} 筆分類已更正，${skippedAmbiguous} 筆因來源不唯一而跳過（需人工確認）`);

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
