import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropProfileLevel1785920000000 implements MigrationInterface {
  name = 'DropProfileLevel1785920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "level"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 原本是 NOT NULL 沒有預設值，既有資料補空字串才加得回去（原本的等級文字無法還原）
    await queryRunner.query(`ALTER TABLE "profiles" ADD "level" character varying NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "level" DROP DEFAULT`);
  }
}
