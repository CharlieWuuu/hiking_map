// 稽核腳本：比對 trail_category_map 目前的分類，跟 hiking_map_data 底下三個資料夾實際檔名是否吻合，
// 抓出被前一支 link-hundred-peaks-trails.ts 腳本誤判分類的路線（例如把小百岳資料夾的路線誤標成百岳）。
// 只印報告，不寫入資料庫。
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/audit-category-mismatch.ts

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

// 跟 import-trails.ts 的 cleanName 完全一致，才能正確還原出當初寫進 trails.name 的值
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

  // 資料夾裡每個清理後的檔名屬於哪個分類（folder -> categoryName），用來反查一個 trail 名稱「應該」是什麼分類
  const nameToExpectedCategories = new Map<string, Set<string>>();
  for (const [categoryName, dir] of Object.entries(CATEGORY_DIRS)) {
    const files = readdirSync(join(DATA_DIR, dir)).filter((f) => f.toLowerCase().endsWith('.gpx'));
    for (const file of files) {
      const name = cleanName(file);
      if (!nameToExpectedCategories.has(name)) nameToExpectedCategories.set(name, new Set());
      nameToExpectedCategories.get(name)!.add(categoryName);
    }
  }

  const rows: { trail_id: number; name: string; category_name: string }[] = await dataSource.query(
    `SELECT t.id AS trail_id, t.name, c.name AS category_name
     FROM trails t
     JOIN trail_category_map tcm ON tcm.trail_id = t.id
     JOIN categories c ON c.id = tcm.category_id
     ORDER BY t.id`,
  );

  const mismatches: { trail_id: number; name: string; assigned: string; expected: string[] }[] = [];
  for (const row of rows) {
    const expected = nameToExpectedCategories.get(row.name);
    if (!expected) continue; // 名稱在任何資料夾都找不到，跳過（可能是舊資料/改名過，另外處理）
    if (!expected.has(row.category_name)) {
      mismatches.push({ trail_id: row.trail_id, name: row.name, assigned: row.category_name, expected: [...expected] });
    }
  }

  console.log(`共檢查 ${rows.length} 筆分類記錄，發現 ${mismatches.length} 筆分類與檔案來源資料夾不符：\n`);
  for (const m of mismatches) {
    console.log(`  [id=${m.trail_id}] ${m.name} — 目前標記：${m.assigned}，應該是：${m.expected.join('、')}`);
  }

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
