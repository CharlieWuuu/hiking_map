import { MigrationInterface, QueryRunner } from 'typeorm';

// 軌跡改成分層儲存：
//   meta（center / bbox）→ 判斷是否進入視野、cluster、panTo
//   簡化線（geom_simplified）→ 一般縮放層級畫在地圖上
//   完整軌跡（geom 留作真實來源，另存一份到 R2 給瀏覽器直接抓）→ 高縮放與匯出
//
// center / bbox 用 generated column，資料庫自己維護，軌跡被裁切或合併後不會不同步。
// 簡化線沒辦法用 generated column（ST_SimplifyPreserveTopology 不是 IMMUTABLE），
// 所以由 HikesService 在寫入軌跡時一併產生。
export class HikeTrackTiers1786000000000 implements MigrationInterface {
  name = 'HikeTrackTiers1786000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "hike_tracks"
        ADD "geom_simplified" geometry(MultiLineString, 4326),
        ADD "track_url" character varying,
        ADD "point_count" integer,
        ADD "center" geometry(Point, 4326)
          GENERATED ALWAYS AS (ST_Centroid("geom")) STORED,
        ADD "bbox" geometry(Polygon, 4326)
          GENERATED ALWAYS AS (ST_Envelope("geom")) STORED
    `);

    // 0.00045 度在台灣的緯度約等於 45～50 公尺。既然高縮放時會另外去 R2 抓完整軌跡，
    // 簡化線就可以壓得很兇——一條郊山路線通常從數千點降到數十點。
    await queryRunner.query(`
      UPDATE "hike_tracks"
      SET "geom_simplified" = ST_Multi(ST_SimplifyPreserveTopology("geom", 0.00045)),
          "point_count" = ST_NPoints("geom")
    `);

    // 視野查詢（ST_Intersects）用 bbox，panTo 與 cluster 用 center
    await queryRunner.query(`CREATE INDEX "IDX_hike_tracks_bbox" ON "hike_tracks" USING GIST ("bbox")`);
    await queryRunner.query(`CREATE INDEX "IDX_hike_tracks_center" ON "hike_tracks" USING GIST ("center")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_hike_tracks_center"`);
    await queryRunner.query(`DROP INDEX "IDX_hike_tracks_bbox"`);
    await queryRunner.query(`
      ALTER TABLE "hike_tracks"
        DROP COLUMN "bbox",
        DROP COLUMN "center",
        DROP COLUMN "point_count",
        DROP COLUMN "track_url",
        DROP COLUMN "geom_simplified"
    `);
  }
}
