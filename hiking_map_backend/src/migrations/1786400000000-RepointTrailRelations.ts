import { MigrationInterface, QueryRunner } from 'typeorm';

// trails 表重建後（見 TrailGeometryTiers1786300000000），trail_category_map /
// trail_mountains / hikes 的外鍵仍指向改名後的 trails_old，新增的步道完全沒有分類
// 跟百岳標記。這裡改用「名稱比對」把舊 trail_id 換成新 trails.id：
// - 新表有 34 組重複名稱（同一條路線被匯入兩次，slug 帶 -2 後綴），這種情況兩條新
//   trail 都算數，所以用 JOIN 而非子查詢，允許一筆舊關聯展開成多筆新關聯。
// - 有少數舊步道在新表完全找不到同名（可能是 40 筆匯入時跳過的無效 GPX，或改名後
//   對不上），這些關聯資料直接遺失，需要之後人工比對回補。
// - hikes.trail_id 只有 4 筆非 NULL，且都對不上新表名稱，直接設為 NULL。
export class RepointTrailRelations1786400000000 implements MigrationInterface {
  name = 'RepointTrailRelations1786400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TEMP TABLE trail_category_map_remap AS
      SELECT DISTINCT tnew.id AS new_trail_id, m.category_id
      FROM trail_category_map m
      JOIN trails_old told ON told.id = m.trail_id
      JOIN trails tnew ON tnew.name = told.name
    `);
    await queryRunner.query(`
      CREATE TEMP TABLE trail_mountains_remap AS
      SELECT DISTINCT tnew.id AS new_trail_id, m.mountain_id
      FROM trail_mountains m
      JOIN trails_old told ON told.id = m.trail_id
      JOIN trails tnew ON tnew.name = told.name
    `);

    await queryRunner.query(`ALTER TABLE "hikes" DROP CONSTRAINT "FK_aca5e7203b1e10af8d2cfa14318"`);
    await queryRunner.query(`UPDATE "hikes" SET "trail_id" = NULL WHERE "trail_id" IS NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE "hikes" ADD CONSTRAINT "FK_aca5e7203b1e10af8d2cfa14318"
      FOREIGN KEY ("trail_id") REFERENCES "trails"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`ALTER TABLE "trail_category_map" DROP CONSTRAINT "FK_a8a56fe1d43969f6fa67d463ae5"`);
    await queryRunner.query(`TRUNCATE "trail_category_map"`);
    await queryRunner.query(`
      INSERT INTO "trail_category_map" (trail_id, category_id)
      SELECT new_trail_id, category_id FROM trail_category_map_remap
    `);
    await queryRunner.query(`
      ALTER TABLE "trail_category_map" ADD CONSTRAINT "FK_a8a56fe1d43969f6fa67d463ae5"
      FOREIGN KEY ("trail_id") REFERENCES "trails"("id")
    `);

    await queryRunner.query(`ALTER TABLE "trail_mountains" DROP CONSTRAINT "FK_00dd465f24a9b456bfbe01ea36d"`);
    await queryRunner.query(`TRUNCATE "trail_mountains"`);
    await queryRunner.query(`
      INSERT INTO "trail_mountains" (trail_id, mountain_id)
      SELECT new_trail_id, mountain_id FROM trail_mountains_remap
    `);
    await queryRunner.query(`
      ALTER TABLE "trail_mountains" ADD CONSTRAINT "FK_00dd465f24a9b456bfbe01ea36d"
      FOREIGN KEY ("trail_id") REFERENCES "trails"("id")
    `);
  }

  public async down(): Promise<void> {
    throw new Error(
      'RepointTrailRelations1786400000000 不可逆：trail_category_map / trail_mountains 的舊資料已被 TRUNCATE 覆蓋，hikes.trail_id 已被清空。若需還原請從備份還原。',
    );
  }
}
