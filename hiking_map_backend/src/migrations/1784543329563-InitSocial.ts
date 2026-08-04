import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSocial1784543329563 implements MigrationInterface {
    name = 'InitSocial1784543329563'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hikes" DROP CONSTRAINT "FK_hikes_trail_id"`);
        await queryRunner.query(`CREATE TABLE "follows" ("follower_user_id" integer NOT NULL, "following_user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e84dc4e994a9439258bc64700e" PRIMARY KEY ("follower_user_id", "following_user_id"))`);
        await queryRunner.query(`CREATE TABLE "collections" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "item_type" character varying NOT NULL, "item_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_21c00b1ebbd41ba1354242c5c4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "follows" ADD CONSTRAINT "FK_9c3525df310a19926ca33b0da83" FOREIGN KEY ("follower_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "follows" ADD CONSTRAINT "FK_afe636fd5d9cf912133e7eb7aeb" FOREIGN KEY ("following_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "collections" ADD CONSTRAINT "FK_728c4a63e823bcd4c687fe46747" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hikes" ADD CONSTRAINT "FK_aca5e7203b1e10af8d2cfa14318" FOREIGN KEY ("trail_id") REFERENCES "trails"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hikes" DROP CONSTRAINT "FK_aca5e7203b1e10af8d2cfa14318"`);
        await queryRunner.query(`ALTER TABLE "collections" DROP CONSTRAINT "FK_728c4a63e823bcd4c687fe46747"`);
        await queryRunner.query(`ALTER TABLE "follows" DROP CONSTRAINT "FK_afe636fd5d9cf912133e7eb7aeb"`);
        await queryRunner.query(`ALTER TABLE "follows" DROP CONSTRAINT "FK_9c3525df310a19926ca33b0da83"`);
        await queryRunner.query(`DROP TABLE "collections"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`ALTER TABLE "hikes" ADD CONSTRAINT "FK_hikes_trail_id" FOREIGN KEY ("trail_id") REFERENCES "trails"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
