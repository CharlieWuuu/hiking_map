import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMountainsTrails1784543090755 implements MigrationInterface {
    name = 'InitMountainsTrails1784543090755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "trails" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "distance_km" double precision, CONSTRAINT "PK_b3f5fcb70ca142a3087a0736bbb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mountains" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "elevation_m" double precision NOT NULL, "location" geometry(Point,4326) NOT NULL, "range" character varying, "county" character varying, CONSTRAINT "UQ_975861b2d03dcf97f5aebc1cad5" UNIQUE ("name"), CONSTRAINT "PK_9625c72a7c15226faa2ae3532a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trail_mountains" ("trail_id" integer NOT NULL, "mountain_id" integer NOT NULL, CONSTRAINT "PK_e1b32f6d76069415b8dc8d83596" PRIMARY KEY ("trail_id", "mountain_id"))`);
        await queryRunner.query(`CREATE TABLE "trail_geometries" ("trail_id" integer NOT NULL, "geom" geometry(LineString,4326) NOT NULL, CONSTRAINT "PK_6e16382795136b53bc6e7b6cece" PRIMARY KEY ("trail_id"))`);
        await queryRunner.query(`CREATE TABLE "trail_category_map" ("trail_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_de58017e332fe348e00909f1a3a" PRIMARY KEY ("trail_id", "category_id"))`);
        await queryRunner.query(`CREATE TABLE "mountain_category_map" ("mountain_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_20a945f57079224d57032d8b168" PRIMARY KEY ("mountain_id", "category_id"))`);
        await queryRunner.query(`ALTER TABLE "trail_mountains" ADD CONSTRAINT "FK_00dd465f24a9b456bfbe01ea36d" FOREIGN KEY ("trail_id") REFERENCES "trails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trail_mountains" ADD CONSTRAINT "FK_769c8ed4a870776242c404d0717" FOREIGN KEY ("mountain_id") REFERENCES "mountains"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trail_geometries" ADD CONSTRAINT "FK_6e16382795136b53bc6e7b6cece" FOREIGN KEY ("trail_id") REFERENCES "trails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trail_category_map" ADD CONSTRAINT "FK_a8a56fe1d43969f6fa67d463ae5" FOREIGN KEY ("trail_id") REFERENCES "trails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trail_category_map" ADD CONSTRAINT "FK_605d70ae8f456c8910124f30c3c" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mountain_category_map" ADD CONSTRAINT "FK_bf31a832d0869c3c7447c1f6f5c" FOREIGN KEY ("mountain_id") REFERENCES "mountains"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mountain_category_map" ADD CONSTRAINT "FK_d3bd360dd2c0e472a1e85d95a07" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hikes" ADD CONSTRAINT "FK_hikes_trail_id" FOREIGN KEY ("trail_id") REFERENCES "trails"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hikes" DROP CONSTRAINT "FK_hikes_trail_id"`);
        await queryRunner.query(`ALTER TABLE "mountain_category_map" DROP CONSTRAINT "FK_d3bd360dd2c0e472a1e85d95a07"`);
        await queryRunner.query(`ALTER TABLE "mountain_category_map" DROP CONSTRAINT "FK_bf31a832d0869c3c7447c1f6f5c"`);
        await queryRunner.query(`ALTER TABLE "trail_category_map" DROP CONSTRAINT "FK_605d70ae8f456c8910124f30c3c"`);
        await queryRunner.query(`ALTER TABLE "trail_category_map" DROP CONSTRAINT "FK_a8a56fe1d43969f6fa67d463ae5"`);
        await queryRunner.query(`ALTER TABLE "trail_geometries" DROP CONSTRAINT "FK_6e16382795136b53bc6e7b6cece"`);
        await queryRunner.query(`ALTER TABLE "trail_mountains" DROP CONSTRAINT "FK_769c8ed4a870776242c404d0717"`);
        await queryRunner.query(`ALTER TABLE "trail_mountains" DROP CONSTRAINT "FK_00dd465f24a9b456bfbe01ea36d"`);
        await queryRunner.query(`DROP TABLE "mountain_category_map"`);
        await queryRunner.query(`DROP TABLE "trail_category_map"`);
        await queryRunner.query(`DROP TABLE "trail_geometries"`);
        await queryRunner.query(`DROP TABLE "trail_mountains"`);
        await queryRunner.query(`DROP TABLE "mountains"`);
        await queryRunner.query(`DROP TABLE "trails"`);
    }

}
