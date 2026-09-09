import * as dotenv from 'dotenv';
dotenv.config();

import { AppDataSource } from '../data-source';
import { UploadsService } from '../uploads/uploads.service';

// 一次性腳本：把既有紀錄的完整軌跡補上傳到 R2。
// 分層儲存上線前的資料只有 geom，沒有 track_url，放大時會一直退回簡化線。
//
//   npx ts-node src/scripts/backfill-track-urls.ts
//
// 可重複執行，已經有 track_url 的紀錄會跳過。
async function main() {
  await AppDataSource.initialize();
  const uploads = new UploadsService();

  const rows: { hike_id: number; geojson: string }[] = await AppDataSource.query(
    `SELECT hike_id, ST_AsGeoJSON(geom, 6) AS geojson
     FROM hike_tracks
     WHERE track_url IS NULL
     ORDER BY hike_id`,
  );

  console.log(`待處理 ${rows.length} 筆`);

  let done = 0;
  for (const row of rows) {
    const url = await uploads.uploadImmutableJson(JSON.parse(row.geojson), 'tracks');
    await AppDataSource.query(`UPDATE hike_tracks SET track_url = $2 WHERE hike_id = $1`, [row.hike_id, url]);
    done += 1;
    if (done % 20 === 0) console.log(`  ${done}/${rows.length}`);
  }

  console.log(`完成 ${done} 筆`);
  await AppDataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
