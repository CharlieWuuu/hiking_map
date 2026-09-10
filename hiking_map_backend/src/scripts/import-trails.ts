import * as dotenv from 'dotenv';
dotenv.config();

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

import { AppDataSource } from '../data-source';
import { convertGpxToGeojson } from '../common/utils/geo-convert.utils';

// 一次性腳本：把本機 hiking_map_data 底下的 366 個 GPX 全部匯入官方步道表。
// trails / trail_geometries 由對應的 migration（TrailGeometryTiers）先清空重建，
// 這裡只負責讀檔、轉 geometry、算簡化線、上傳 R2、寫回資料庫。
//
//   npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts
//   npx ts-node src/scripts/import-trails.ts

const DATA_DIR = join(__dirname, '../../../hiking_map_data');
const CATEGORY_DIRS = ['百岳', '小百岳', '百大步道'];
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

// 檔名常帶日期字首/後綴（20180729、2020-03-28 07:19 等），清掉才是可讀的步道名稱
function cleanName(filename: string): string {
  const withoutExt = filename.replace(/\.gpx$/i, '');
  return withoutExt
    .replace(/^\d{4}[-._]?\d{2}[-._]?\d{2}[\s_-]*/, '') // 開頭日期
    .replace(/^\d{4}[-._]?\d{2}[-._]?\d{2}[\s_-]*\d{2}[:：]\d{2}[\s_-]*/, '') // 開頭日期+時間
    .replace(/[-_\s]*\d{8}[-_]\d{2}$/, '') // 結尾 -20150702-08 這種
    .trim();
}

async function uploadGpxToR2(buffer: Buffer, slug: string): Promise<string> {
  const key = `trails/${slug}-${randomUUID()}.gpx`;
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'application/gpx+xml',
    }),
  );
  return `${R2_PUBLIC_URL}/${key}`;
}

async function main() {
  await AppDataSource.initialize();

  const usedSlugs = new Set<string>();
  let imported = 0;
  let skipped = 0;

  for (const category of CATEGORY_DIRS) {
    const dir = join(DATA_DIR, category);
    const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.gpx'));

    for (const filename of files) {
      const filePath = join(dir, filename);
      const buffer = readFileSync(filePath);

      if (statSync(filePath).size === 0) {
        console.warn(`跳過空檔案：${category}/${filename}`);
        skipped++;
        continue;
      }

      let featureCollection: Awaited<ReturnType<typeof convertGpxToGeojson>>;
      try {
        featureCollection = await convertGpxToGeojson({ buffer } as Express.Multer.File);
      } catch (err) {
        console.warn(`解析失敗，跳過：${category}/${filename} — ${String(err)}`);
        skipped++;
        continue;
      }

      const geometry = featureCollection.features[0].geometry;

      const name = cleanName(filename) || filename.replace(/\.gpx$/i, '');
      let slug = name;
      let suffix = 2;
      while (usedSlugs.has(slug)) {
        slug = `${name}-${suffix}`;
        suffix++;
      }
      usedSlugs.add(slug);

      const trackUrl = await uploadGpxToR2(buffer, slug);

      try {
        // trails 跟 trail_geometries 兩個 INSERT 包進同一個 transaction，
        // 其中一個失敗就整筆回滾，不會留下有 trail 但沒有 geometry 的孤兒紀錄
        await AppDataSource.transaction(async (manager) => {
          const rows: { id: number }[] = await manager.query(`INSERT INTO trails (name, slug) VALUES ($1, $2) RETURNING id`, [name, slug]);
          const trailId = rows[0].id;
          await manager.query(
            `INSERT INTO trail_geometries (trail_id, geom, geom_simplified, point_count, track_url)
             SELECT $1, g, ST_Multi(ST_SimplifyPreserveTopology(g, $3)), ST_NPoints(g), $4
             FROM (SELECT ST_Multi(ST_Force2D(ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))) AS g) AS source`,
            [trailId, JSON.stringify(geometry), SIMPLIFY_TOLERANCE_DEG, trackUrl],
          );
        });
        imported++;
        if (imported % 20 === 0) console.log(`已匯入 ${imported} 筆...`);
      } catch (err) {
        console.warn(`寫入資料庫失敗，跳過：${category}/${filename} — ${String(err)}`);
        skipped++;
      }
    }
  }

  console.log(`完成。匯入 ${imported} 筆，跳過 ${skipped} 筆。`);
  await AppDataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
