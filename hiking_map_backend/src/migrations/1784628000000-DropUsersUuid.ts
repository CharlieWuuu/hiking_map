import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUsersUuid1784628000000 implements MigrationInterface {
  name = 'DropUsersUuid1784628000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "uuid"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "uuid" character varying`);
  }
}
