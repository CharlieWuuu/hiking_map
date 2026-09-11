import { MigrationInterface, QueryRunner } from 'typeorm';

// 「hike 分類旗標」（百岳/小百岳/百大必訪）整個功能移除：
// findOne/findAll 一直讀的是 trail_category_map（依 hike.trail_id），
// 但 update() 寫的卻是這張表——寫讀來源不一致，使用者手動勾選從未真正生效過。
// 確認過現有資料後這張表幾乎是空的（僅有一筆測試資料，已於移除前手動清掉），
// 不需要額外的資料搬遷。
export class DropHikeCategoryMap1786600000000 implements MigrationInterface {
  name = 'DropHikeCategoryMap1786600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "hike_category_map" DROP CONSTRAINT "FK_b2808bfe75c291f56437458b105"`);
    await queryRunner.query(`ALTER TABLE "hike_category_map" DROP CONSTRAINT "FK_e6a31c064535fd09364a8505f74"`);
    await queryRunner.query(`DROP TABLE "hike_category_map"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "hike_category_map" ("hike_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_b31599749293987b11af2eb8dc1" PRIMARY KEY ("hike_id", "category_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "hike_category_map" ADD CONSTRAINT "FK_e6a31c064535fd09364a8505f74" FOREIGN KEY ("hike_id") REFERENCES "hikes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "hike_category_map" ADD CONSTRAINT "FK_b2808bfe75c291f56437458b105" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
