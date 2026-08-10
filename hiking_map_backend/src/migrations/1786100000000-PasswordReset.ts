import { MigrationInterface, QueryRunner } from 'typeorm';

// 忘記密碼流程需要一個能寄信的身分憑證，但 users 本來只有 username／password，
// 所以先補上 email；同時建立重設用的 token 表。
//
// token 只存 SHA-256 雜湊，跟密碼一樣的道理——資料庫被看到也不能直接拿去重設。
export class PasswordReset1786100000000 implements MigrationInterface {
  name = 'PasswordReset1786100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 既有使用者沒有 email，所以必須允許 NULL
    await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email") WHERE "email" IS NOT NULL`);

    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" SERIAL PRIMARY KEY,
        "user_id" integer NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "token_hash" character varying NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "used_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_password_reset_tokens_token_hash" ON "password_reset_tokens" ("token_hash")`);
    await queryRunner.query(`CREATE INDEX "IDX_password_reset_tokens_user_id" ON "password_reset_tokens" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
  }
}
