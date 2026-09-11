import { MigrationInterface, QueryRunner } from 'typeorm';

// hikes.trail_id 只有選了官方步道才有值，但前端上傳/編輯目前完全沒有選步道的入口，
// 所以「這趟紀錄完成了哪座山」沒辦法透過 hike -> trail -> mountain 這條路算出來。
// 改成讓使用者直接手動標記這趟紀錄對應哪些山頭，不依賴 trail_id。
export class HikeMountains1786200000000 implements MigrationInterface {
  name = 'HikeMountains1786200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "hike_mountains" (
        "hike_id" integer NOT NULL REFERENCES "hikes" ("id") ON DELETE CASCADE,
        "mountain_id" integer NOT NULL REFERENCES "mountains" ("id") ON DELETE CASCADE,
        PRIMARY KEY ("hike_id", "mountain_id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_hike_mountains_mountain_id" ON "hike_mountains" ("mountain_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "hike_mountains"`);
  }
}
