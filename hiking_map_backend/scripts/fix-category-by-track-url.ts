// 依 audit-category-by-track-url.ts 的精確稽核結果（用 track_url 還原真實來源檔名，
// 而非猜測），修正錯誤分類。全部 366 筆都已能 100% 比對，這裡處理確認為真的 15 筆錯誤。
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/fix-category-by-track-url.ts

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

const UUID_SUFFIX_RE = /-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.gpx$/i;
const DEDUPE_SUFFIX_RE = /-\d+$/;

function extractSlugCandidates(trackUrl: string): string[] | null {
  const afterTrails = trackUrl.split('/trails/')[1];
  if (!afterTrails) return null;
  const decoded = decodeURIComponent(afterTrails);
  if (!UUID_SUFFIX_RE.test(decoded)) return null;
  const slug = decoded.replace(UUID_SUFFIX_RE, '');
  const withoutDedupeSuffix = slug.replace(DEDUPE_SUFFIX_RE, '');
  return withoutDedupeSuffix === slug ? [slug] : [slug, withoutDedupeSuffix];
}

async function main() {
  const dataSource = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await dataSource.initialize();

  const filenameToCategories = new Map<string, Set<string>>();
  for (const [categoryName, dir] of Object.entries(CATEGORY_DIRS)) {
    const files = readdirSync(join(DATA_DIR, dir)).filter((f) => f.toLowerCase().endsWith('.gpx'));
    for (const file of files) {
      const key = cleanName(file) || file.replace(/\.gpx$/i, '');
      if (!filenameToCategories.has(key)) filenameToCategories.set(key, new Set());
      filenameToCategories.get(key)!.add(categoryName);
    }
  }

  const categoryRows: { id: number; name: string }[] = await dataSource.query(`SELECT id, name FROM categories`);
  const categoryIdByName = new Map(categoryRows.map((c) => [c.name, c.id]));

  const rows: { trail_id: number; name: string; category_id: number; category_name: string; track_url: string }[] = await dataSource.query(
    `SELECT t.id AS trail_id, t.name, tcm.category_id, c.name AS category_name, tg.track_url
     FROM trails t
     JOIN trail_category_map tcm ON tcm.trail_id = t.id
     JOIN categories c ON c.id = tcm.category_id
     JOIN trail_geometries tg ON tg.trail_id = t.id
     ORDER BY t.id`,
  );

  let added = 0;
  let removed = 0;
  let unresolved = 0;

  for (const row of rows) {
    const candidates = extractSlugCandidates(row.track_url);
    if (!candidates) {
      unresolved++;
      continue;
    }
    const expected = candidates.map((c) => filenameToCategories.get(c)).find((c) => c !== undefined);
    if (!expected) {
      unresolved++;
      continue;
    }
    if (expected.has(row.category_name)) continue; // 本來就對，不動

    // 錯誤分類：移除現有這筆錯的 category_id，並把「應該有但目前沒有」的分類補上
    await dataSource.query(`DELETE FROM trail_category_map WHERE trail_id = $1 AND category_id = $2`, [row.trail_id, row.category_id]);
    removed++;
    console.log(`[id=${row.trail_id}] ${row.name} — 移除錯誤分類：${row.category_name}`);

    for (const correctCategoryName of expected) {
      const correctCategoryId = categoryIdByName.get(correctCategoryName);
      if (!correctCategoryId) continue;
      const exists = await dataSource.query(`SELECT 1 FROM trail_category_map WHERE trail_id = $1 AND category_id = $2`, [
        row.trail_id,
        correctCategoryId,
      ]);
      if (exists.length) continue;
      await dataSource.query(`INSERT INTO trail_category_map (trail_id, category_id) VALUES ($1, $2)`, [row.trail_id, correctCategoryId]);
      added++;
      console.log(`[id=${row.trail_id}] ${row.name} — 補上正確分類：${correctCategoryName}`);
    }
  }

  console.log(`\n完成：移除 ${removed} 筆錯誤分類，新增 ${added} 筆正確分類，${unresolved} 筆無法判斷（不應該有，稽核腳本已確認全部可解）`);

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
