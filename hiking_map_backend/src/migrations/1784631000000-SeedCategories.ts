import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCategories1784631000000 implements MigrationInterface {
  name = 'SeedCategories1784631000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "categories" ("name") VALUES ('百岳'), ('小百岳'), ('百大必訪步道') ON CONFLICT ("name") DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "categories" WHERE "name" IN ('百岳', '小百岳', '百大必訪步道')`);
  }
}
