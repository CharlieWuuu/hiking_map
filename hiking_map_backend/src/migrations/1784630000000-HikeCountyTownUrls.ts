import { MigrationInterface, QueryRunner } from 'typeorm';

export class HikeCountyTownUrls1784630000000 implements MigrationInterface {
  name = 'HikeCountyTownUrls1784630000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "hikes" ADD "county" character varying`);
    await queryRunner.query(`ALTER TABLE "hikes" ADD "town" character varying`);
    await queryRunner.query(`ALTER TABLE "hikes" ADD "urls" character varying array NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "hikes" DROP COLUMN "urls"`);
    await queryRunner.query(`ALTER TABLE "hikes" DROP COLUMN "town"`);
    await queryRunner.query(`ALTER TABLE "hikes" DROP COLUMN "county"`);
  }
}
