import { MigrationInterface, QueryRunner } from 'typeorm';

export class HikeTrailCoverImage1784900160000 implements MigrationInterface {
  name = 'HikeTrailCoverImage1784900160000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "hikes" ADD "cover_image_url" character varying`);
    await queryRunner.query(`ALTER TABLE "trails" ADD "cover_image_url" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "trails" DROP COLUMN "cover_image_url"`);
    await queryRunner.query(`ALTER TABLE "hikes" DROP COLUMN "cover_image_url"`);
  }
}
