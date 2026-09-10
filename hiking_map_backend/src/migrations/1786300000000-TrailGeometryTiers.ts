import { MigrationInterface, QueryRunner } from 'typeorm';

// 官方步道全面重建：本機 hiking_map_data 有 366 個 GPX，舊的 trails/trail_geometries
// 只匯入了 205 筆且沒有分層儲存欄位。這裡不清空舊表，而是把舊表改名備份（trails_old /
// trail_geometries_old），另外新建同名的 trails / trail_geometries——後端程式碼
// （entity/service）完全不用改，外鍵約束會跟著改名的舊表走，不受影響。
//
// 新表補齊跟 hike_tracks 一樣的分層儲存欄位：
//   meta（center / bbox）→ 判斷是否進入視野、排序距離、panTo
//   簡化線（geom_simplified）→ 一般縮放層級畫在地圖上
//   原始 GPX 另存一份到 R2（track_url）→ 備份與匯出
//
// 實際的 366 筆匯入由 src/scripts/import-trails.ts 執行，這裡只負責建表結構。
export class TrailGeometryTiers1786300000000 implements MigrationInterface {
  name = 'TrailGeometryTiers1786300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "trail_geometries" RENAME TO "trail_geometries_old"`);
    await queryRunner.query(`ALTER TABLE "trails" RENAME TO "trails_old"`);

    await queryRunner.query(`
      CREATE TABLE "trails" (
        "id" SERIAL PRIMARY KEY,
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL UNIQUE,
        "county" character varying,
        "town" character varying,
        "description" text,
        "distance_km" double precision,
        "cover_image_url" character varying
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "trail_geometries" (
        "trail_id" integer PRIMARY KEY REFERENCES "trails"("id"),
        "geom" geometry(MultiLineString, 4326) NOT NULL,
        "geom_simplified" geometry(MultiLineString, 4326),
        "track_url" character varying,
        "point_count" integer,
        "center" geometry(Point, 4326) GENERATED ALWAYS AS (ST_Centroid("geom")) STORED,
        "bbox" geometry(Polygon, 4326) GENERATED ALWAYS AS (ST_Envelope("geom")) STORED
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_trail_geometries_bbox" ON "trail_geometries" USING GIST ("bbox")`);
    await queryRunner.query(`CREATE INDEX "IDX_trail_geometries_center" ON "trail_geometries" USING GIST ("center")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "trail_geometries"`);
    await queryRunner.query(`DROP TABLE "trails"`);
    await queryRunner.query(`ALTER TABLE "trails_old" RENAME TO "trails"`);
    await queryRunner.query(`ALTER TABLE "trail_geometries_old" RENAME TO "trail_geometries"`);
  }
}
