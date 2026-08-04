import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrailSlug1784622205000 implements MigrationInterface {
  name = 'TrailSlug1784622205000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "trails" ADD "slug" character varying`);
    await queryRunner.query(`ALTER TABLE "trails" ALTER COLUMN "slug" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "trails" ADD CONSTRAINT "UQ_trails_slug" UNIQUE ("slug")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "trails" DROP CONSTRAINT "UQ_trails_slug"`);
    await queryRunner.query(`ALTER TABLE "trails" DROP COLUMN "slug"`);
  }
}
