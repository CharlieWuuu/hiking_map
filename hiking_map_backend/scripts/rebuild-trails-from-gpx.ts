// 完全重建 trails/trail_geometries/trail_category_map/trail_mountains，
// 唯一依據是 hiking_map_data 三個資料夾實際存在的 GPX 檔案——不碰任何 JSON 清單。
// mountains/mountain_category_map 不動。
//
// 分類判定：一份 GPX 檔案在哪個資料夾出現，就屬於哪個分類；同一份檔案（用檔案內容雜湊比對，
// 不是檔名）出現在多個資料夾，代表這條路線同時屬於多個分類，會建立多筆 trail_category_map。
// 先前用字串猜測分類，混進了像「壁山」這種完全沒有 GPX 資料佐證的錯誤資料——這支腳本徹底避開
// 那個問題，分類完全由檔案實際落在哪個資料夾決定，不做任何名稱層面的猜測比對。
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/rebuild-trails-from-gpx.ts

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { convertGpxToGeojson } from '../src/common/utils/geo-convert.utils';

const DATA_DIR = join(__dirname, '../../hiking_map_data');
const CATEGORY_DIRS: Record<string, string> = {
  百岳: '百岳',
  小百岳: '小百岳',
  百大必訪步道: '百大步道',
};
const SIMPLIFY_TOLERANCE_DEG = 0.00045;

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
const R2_BUCKET = process.env.R2_BUCKET!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

function cleanName(filename: string): string {
  const withoutExt = filename.replace(/\.gpx$/i, '');
  return withoutExt
    .replace(/^\d{4}[-._]?\d{2}[-._]?\d{2}[\s_-]*/, '')
    .replace(/^\d{4}[-._]?\d{2}[-._]?\d{2}[\s_-]*\d{2}[:：]\d{2}[\s_-]*/, '')
    .replace(/[-_\s]*\d{8}[-_]\d{2}$/, '')
    .trim();
}

// R2 偶爾會回傳 409（XML parse error），實測是暫時性的，重試就過了，不代表這個 key 真的衝突
async function uploadGpxToR2(buffer: Buffer, slug: string, attempt = 1): Promise<string> {
  const key = `trails/${slug}-${randomUUID()}.gpx`;
  try {
    await s3.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: buffer, ContentType: 'application/gpx+xml' }));
    return `${R2_PUBLIC_URL}/${key}`;
  } catch (err) {
    if (attempt >= 3) throw err;
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    return uploadGpxToR2(buffer, slug, attempt + 1);
  }
}

type FileEntry = { category: string; filename: string; path: string; buffer: Buffer; hash: string };

async function main() {
  const dataSource = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await dataSource.initialize();

  // Step 1：掃描三個資料夾，用檔案內容雜湊值把同一份 GPX（即使檔名不同或放在多個資料夾）歸為同一條路線
  const allFiles: FileEntry[] = [];
  for (const [categoryName, dir] of Object.entries(CATEGORY_DIRS)) {
    const files = readdirSync(join(DATA_DIR, dir)).filter((f) => f.toLowerCase().endsWith('.gpx'));
    for (const filename of files) {
      const path = join(DATA_DIR, dir, filename);
      if (statSync(path).size === 0) {
        console.warn(`跳過空檔案：${dir}/${filename}`);
        continue;
      }
      const buffer = readFileSync(path);
      const hash = createHash('sha256').update(buffer).digest('hex');
      allFiles.push({ category: categoryName, filename, path, buffer, hash });
    }
  }

  const byHash = new Map<string, FileEntry[]>();
  for (const entry of allFiles) {
    if (!byHash.has(entry.hash)) byHash.set(entry.hash, []);
    byHash.get(entry.hash)!.push(entry);
  }

  console.log(`掃描到 ${allFiles.length} 個 GPX 檔案，去重後為 ${byHash.size} 條不重複路線`);

  // Step 2：清空舊資料（依外鍵順序），mountains 相關表不動
  await dataSource.query(`DELETE FROM trail_mountains`);
  await dataSource.query(`DELETE FROM trail_category_map`);
  await dataSource.query(`DELETE FROM trail_geometries`);
  await dataSource.query(`DELETE FROM trails`);
  console.log('已清空 trails / trail_geometries / trail_category_map / trail_mountains');

  const categoryRows: { id: number; name: string }[] = await dataSource.query(`SELECT id, name FROM categories`);
  const categoryIdByName = new Map(categoryRows.map((c) => [c.name, c.id]));

  // Step 3：逐條不重複路線匯入，分類 = 這份檔案（用雜湊比對）出現過的所有資料夾
  const usedSlugs = new Set<string>();
  let imported = 0;
  let skipped = 0;

  for (const [, entries] of byHash) {
    // 同一份內容可能有多個檔名（例如撞名複製），取第一個當代表名稱
    const primary = entries[0];
    const categoriesForThisTrail = [...new Set(entries.map((e) => e.category))];

    let featureCollection: Awaited<ReturnType<typeof convertGpxToGeojson>>;
    try {
      featureCollection = await convertGpxToGeojson({ buffer: primary.buffer } as Express.Multer.File);
    } catch (err) {
      console.warn(`解析失敗，跳過：${primary.filename} — ${String(err)}`);
      skipped++;
      continue;
    }
    const geometry = featureCollection.features[0].geometry;

    const name = cleanName(primary.filename) || primary.filename.replace(/\.gpx$/i, '');
    let slug = name;
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${name}-${suffix}`;
      suffix++;
    }
    usedSlugs.add(slug);

    let trackUrl: string;
    try {
      trackUrl = await uploadGpxToR2(primary.buffer, slug);
    } catch (err) {
      console.warn(`上傳 R2 失敗，跳過：${primary.filename}（slug=${slug}） — ${String(err)}`);
      skipped++;
      continue;
    }

    try {
      await dataSource.transaction(async (manager) => {
        const rows: { id: number }[] = await manager.query(`INSERT INTO trails (name, slug) VALUES ($1, $2) RETURNING id`, [name, slug]);
        const trailId = rows[0].id;
        await manager.query(
          `INSERT INTO trail_geometries (trail_id, geom, geom_simplified, point_count, track_url)
           SELECT $1, g, ST_Multi(ST_SimplifyPreserveTopology(g, $3)), ST_NPoints(g), $4
           FROM (SELECT ST_Multi(ST_Force2D(ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))) AS g) AS source`,
          [trailId, JSON.stringify(geometry), SIMPLIFY_TOLERANCE_DEG, trackUrl],
        );
        for (const categoryName of categoriesForThisTrail) {
          const categoryId = categoryIdByName.get(categoryName);
          if (!categoryId) continue;
          await manager.query(`INSERT INTO trail_category_map (trail_id, category_id) VALUES ($1, $2)`, [trailId, categoryId]);
        }
      });
      imported++;
      if (imported % 50 === 0) console.log(`已匯入 ${imported} 筆...`);
    } catch (err) {
      console.warn(`寫入資料庫失敗，跳過：${primary.filename}（slug=${slug}） — ${String(err)}`);
      skipped++;
    }
  }

  console.log(`完成。匯入 ${imported} 筆不重複路線，跳過 ${skipped} 筆。`);
  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
