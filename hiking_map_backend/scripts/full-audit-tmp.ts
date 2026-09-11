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

  const rows: { trail_id: number; name: string; category_name: string }[] = await dataSource.query(
    `SELECT t.id AS trail_id, t.name, c.name AS category_name
     FROM trails t
     JOIN trail_category_map tcm ON tcm.trail_id = t.id
     JOIN categories c ON c.id = tcm.category_id
     ORDER BY t.id`,
  );

  let noSourceFound = 0;
  let matched = 0;
  let mismatched = 0;
  const noSourceList: string[] = [];

  for (const row of rows) {
    const expected = nameToExpectedCategories.get(row.name);
    if (!expected) {
      noSourceFound++;
      noSourceList.push(`[id=${row.trail_id}] ${row.name} (目前標記: ${row.category_name})`);
      continue;
    }
    if (expected.has(row.category_name)) matched++;
    else mismatched++;
  }

  console.log(`總分類記錄: ${rows.length}`);
  console.log(`比對到來源且吻合: ${matched}`);
  console.log(`比對到來源但不吻合: ${mismatched}`);
  console.log(`完全找不到來源資料夾(這些是稽核腳本會跳過、可能藏問題的): ${noSourceFound}`);
  console.log('\n找不到來源的清單:');
  noSourceList.forEach(s => console.log('  - ' + s));

  // 反向檢查：資料夾裡有的名稱，資料庫裡是否都有對應且分類正確
  console.log('\n=== 反向檢查：資料夾檔名在資料庫裡找不到 trail 的 ===');
  const allTrailNames = new Set(rows.map(r => r.name));
  const allTrailsInDb: {name: string}[] = await dataSource.query(`SELECT name FROM trails`);
  const allTrailNameSet = new Set(allTrailsInDb.map(t => t.name));
  for (const [name, cats] of nameToExpectedCategories) {
    if (!allTrailNameSet.has(name)) {
      console.log(`  - ${name} (應屬於: ${[...cats].join('、')}) — trails 表完全沒有這個名字`);
    }
  }

  await dataSource.destroy();
}

main().catch(e => { console.error(e); process.exit(1); });
