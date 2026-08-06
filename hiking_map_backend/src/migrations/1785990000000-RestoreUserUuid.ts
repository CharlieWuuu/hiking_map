import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 舊版前端（v1）用 uuid 辨識使用者，重構成新 schema 時這個欄位被拿掉了。
 * 要讓舊站重新上線就得補回來，而且必須對得回 users_trails.owner_uuid，
 * 否則舊資料會查不到主人。
 *
 * 對應關係取自 users_log（它同時存了 user_id 與當年的 uuid）。
 */
export class RestoreUserUuid1785990000000 implements MigrationInterface {
  name = 'RestoreUserUuid1785990000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "uuid" uuid NOT NULL DEFAULT gen_random_uuid()`);

    // users_log 有留下當年的對應，優先照它還原
    await queryRunner.query(`
      UPDATE users u
      SET uuid = l.uuid::uuid
      FROM (
        SELECT DISTINCT ON (user_id) user_id, uuid
        FROM users_log
        WHERE uuid <> '00000000-0000-0000-0000-000000000000'
        ORDER BY user_id, login_time DESC
      ) l
      WHERE l.user_id = u.id
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_uuid" ON "users" ("uuid")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_users_uuid"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "uuid"`);
  }
}
