import { MigrationInterface, QueryRunner } from 'typeorm';

// trails 表重建（見 TrailGeometryTiers1786300000000）之後，所有 hikes.trail_id 都變成 NULL
// （新 trails.id 跟舊的完全對不上，之前 RepointTrailRelations1786400000000 已經把對不上的清空）。
// 這裡只挑名稱能「唯一」比對到新 trails 的 hikes（排除比對到重複名稱的情況，那種要人工確認才能決定
// 接哪一條），把 trail_id 接回去，讓這些紀錄能正確顯示分類（百岳／小百岳／百大必訪步道）。
// 大部分 hikes 名稱本來就不是官方步道名（例如個人紀錄常見的「測試」「XX縱走」），
// 這些沒被這支 migration 動到，trail_id 保持 NULL，之後如需要再人工核對。
export class RelinkHikeTrailByName1786500000000 implements MigrationInterface {
  name = 'RelinkHikeTrailByName1786500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "hikes" h
      SET "trail_id" = t.id
      FROM "trails" t
      WHERE t.name = h.name
        AND h.trail_id IS NULL
        AND t.name NOT IN (SELECT name FROM "trails" GROUP BY name HAVING count(*) > 1)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "hikes"
      SET "trail_id" = NULL
      WHERE "trail_id" IN (
        SELECT t.id FROM "trails" t
        WHERE t.name NOT IN (SELECT name FROM "trails" GROUP BY name HAVING count(*) > 1)
      )
    `);
  }
}
