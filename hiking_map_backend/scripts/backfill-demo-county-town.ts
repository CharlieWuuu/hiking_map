// 補上 demo 帳號健行紀錄缺的縣市/鄉鎮：用軌跡中點座標打 Nominatim 反查地址。
// 一次性腳本，直接對正式資料庫執行；Nominatim 使用政策要求最多 1 req/秒，這裡逐筆序列處理。
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/backfill-demo-county-town.ts

import 'dotenv/config';
import { DataSource } from 'typeorm';

const DEMO_USER_ID = 7;
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
const REQUEST_INTERVAL_MS = 1100;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Nominatim 回傳的行政區字串跟資料庫慣例（省略「臺/台」寫法差異）不完全一致，這裡統一成常見寫法
function normalizeCounty(raw: string): string {
  return raw.replace(/^臺/, '台');
}

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await dataSource.initialize();

  try {
    const rows: { id: number; name: string; point: string }[] = await dataSource.query(
      `SELECT h.id, h.name, ST_AsText(ST_PointOnSurface(ht.geom)) AS point
       FROM hikes h
       JOIN hike_tracks ht ON ht.hike_id = h.id
       WHERE h.user_id = $1 AND (h.county IS NULL OR h.county = '' OR h.town IS NULL OR h.town = '')
       ORDER BY h.id`,
      [DEMO_USER_ID],
    );

    let updated = 0;
    let failed = 0;

    for (const row of rows) {
      const match = row.point.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
      if (!match) {
        failed++;
        continue;
      }
      const [, lon, lat] = match;

      try {
        const res = await fetch(`${NOMINATIM_URL}?lat=${lat}&lon=${lon}&format=json&accept-language=zh-TW&zoom=14`, {
          headers: { 'User-Agent': 'hiking-map-demo-seed/1.0 (charlie personal project)' },
        });
        const json = await res.json();
        const address = json.address ?? {};
        const county = address.city ?? address.county ?? null;
        const town = address.suburb ?? address.town ?? address.county ?? null;

        if (county) {
          await dataSource.query(`UPDATE hikes SET county = $1, town = $2 WHERE id = $3`, [
            normalizeCounty(county),
            town ?? null,
            row.id,
          ]);
          updated++;
          console.log(`${row.name} -> ${normalizeCounty(county)} ${town ?? ''}`);
        } else {
          failed++;
          console.log(`${row.name} -> 查無地址`);
        }
      } catch (err) {
        failed++;
        console.error(`${row.name} 查詢失敗:`, err);
      }

      await sleep(REQUEST_INTERVAL_MS);
    }

    console.log(`更新 ${updated} 筆，失敗/查無 ${failed} 筆，共 ${rows.length} 筆`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
