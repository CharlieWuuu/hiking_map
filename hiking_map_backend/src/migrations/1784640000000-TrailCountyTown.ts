import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrailCountyTown1784640000000 implements MigrationInterface {
  name = 'TrailCountyTown1784640000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "trails" ADD "county" character varying`);
    await queryRunner.query(`ALTER TABLE "trails" ADD "town" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "trails" DROP COLUMN "town"`);
    await queryRunner.query(`ALTER TABLE "trails" DROP COLUMN "county"`);
  }
}
