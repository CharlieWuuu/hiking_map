// 精確稽核：trail_geometries.track_url 保留了「清理檔名前」的原始檔名（去掉副檔名、拼上 uuid），
// 不必再模擬 import-trails.ts 的 cleanName() 邏輯去猜——直接從 track_url 反解出原始檔名，
// 對照三個資料夾實際的原始檔名清單，100% 準確判斷每一筆 trail 真正來自哪個資料夾/該屬於哪個分類。
// 檢查全部 366 筆，不只挑看起來眼熟的。
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/audit-category-by-track-url.ts

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

// 跟 import-trails.ts 逐字一致的 cleanName（複製原文，不是重寫模擬），
// 這樣資料夾檔名清單才會跟當初真正寫進 trails.name/slug 的值用同一套規則處理
function cleanName(filename: string): string {
  const withoutExt = filename.replace(/\.gpx$/i, '');
  return withoutExt
    .replace(/^\d{4}[-._]?\d{2}[-._]?\d{2}[\s_-]*/, '')
    .replace(/^\d{4}[-._]?\d{2}[-._]?\d{2}[\s_-]*\d{2}[:：]\d{2}[\s_-]*/, '')
    .replace(/[-_\s]*\d{8}[-_]\d{2}$/, '')
    .trim();
}

// track_url 格式：.../trails/<slug>-<uuid>.gpx，其中 slug 是 cleanName(filename) 的結果，
// 可能因撞名被加了 "-2"、"-3" 這種編號後綴（見 import-trails.ts 的 usedSlugs 邏輯）。
// uuid 是標準 36 字元格式，從結尾往回切掉 "-<uuid>.gpx" 先還原出 slug，
// 再嘗試去掉結尾的 "-數字" 撞名後綴，兩種形式都拿去對資料夾檔名清單比對
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

  // cleanName(檔名) -> 屬於哪些分類，跟 slug 用同一套規則才能對上
  const filenameToCategories = new Map<string, Set<string>>();
  for (const [categoryName, dir] of Object.entries(CATEGORY_DIRS)) {
    const files = readdirSync(join(DATA_DIR, dir)).filter((f) => f.toLowerCase().endsWith('.gpx'));
    for (const file of files) {
      const key = cleanName(file) || file.replace(/\.gpx$/i, '');
      if (!filenameToCategories.has(key)) filenameToCategories.set(key, new Set());
      filenameToCategories.get(key)!.add(categoryName);
    }
  }

  const rows: { trail_id: number; name: string; category_name: string; track_url: string }[] = await dataSource.query(
    `SELECT t.id AS trail_id, t.name, c.name AS category_name, tg.track_url
     FROM trails t
     JOIN trail_category_map tcm ON tcm.trail_id = t.id
     JOIN categories c ON c.id = tcm.category_id
     JOIN trail_geometries tg ON tg.trail_id = t.id
     ORDER BY t.id`,
  );

  let matched = 0;
  let mismatched = 0;
  let unresolvable = 0;
  const mismatches: { trail_id: number; name: string; assigned: string; expected: string[] }[] = [];
  const unresolvableList: string[] = [];

  for (const row of rows) {
    const candidates = extractSlugCandidates(row.track_url);
    if (!candidates) {
      unresolvable++;
      unresolvableList.push(`[id=${row.trail_id}] ${row.name} — track_url 格式無法解析: ${row.track_url}`);
      continue;
    }

    // 兩種還原形式（含/不含撞名編號後綴）都找不到就算無法判斷；找到任一種就採用該筆的分類集合
    const expected = candidates.map((c) => filenameToCategories.get(c)).find((c) => c !== undefined);
    if (!expected) {
      unresolvable++;
      unresolvableList.push(`[id=${row.trail_id}] ${row.name} — 候選檔名「${candidates.join('」、「')}」在三個資料夾都找不到`);
      continue;
    }

    if (expected.has(row.category_name)) {
      matched++;
    } else {
      mismatched++;
      mismatches.push({ trail_id: row.trail_id, name: row.name, assigned: row.category_name, expected: [...expected] });
    }
  }

  console.log(`總分類記錄: ${rows.length}`);
  console.log(`精確吻合: ${matched}`);
  console.log(`精確不符（真的錯）: ${mismatched}`);
  console.log(`無法解析（track_url 格式異常或找不到原始檔案）: ${unresolvable}`);

  if (mismatches.length) {
    console.log('\n=== 確認錯誤的分類（需要修正）===');
    mismatches.forEach((m) => console.log(`  [id=${m.trail_id}] ${m.name} — 目前：${m.assigned}，應該：${m.expected.join('、')}`));
  }

  if (unresolvableList.length) {
    console.log('\n=== 無法自動判斷，需要人工確認 ===');
    unresolvableList.forEach((s) => console.log('  - ' + s));
  }

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
