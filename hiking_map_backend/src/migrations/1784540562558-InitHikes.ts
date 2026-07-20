import { MigrationInterface, QueryRunner } from "typeorm";

export class InitHikes1784540562558 implements MigrationInterface {
    name = 'InitHikes1784540562558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "hikes" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "trail_id" integer, "name" character varying NOT NULL, "date" date NOT NULL, "distance_km" double precision NOT NULL, "is_public" boolean NOT NULL DEFAULT true, "note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_881b1b0345363b62221642c4dcf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "hike_tracks" ("hike_id" integer NOT NULL, "geom" geometry(LineString,4326) NOT NULL, CONSTRAINT "PK_de48e81cc25f2351bf8f70f9a85" PRIMARY KEY ("hike_id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "hike_category_map" ("hike_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_b31599749293987b11af2eb8dc1" PRIMARY KEY ("hike_id", "category_id"))`);
        await queryRunner.query(`ALTER TABLE "hikes" ADD CONSTRAINT "FK_761d26c0878d1668effa3aa2c09" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hike_tracks" ADD CONSTRAINT "FK_de48e81cc25f2351bf8f70f9a85" FOREIGN KEY ("hike_id") REFERENCES "hikes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hike_category_map" ADD CONSTRAINT "FK_e6a31c064535fd09364a8505f74" FOREIGN KEY ("hike_id") REFERENCES "hikes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hike_category_map" ADD CONSTRAINT "FK_b2808bfe75c291f56437458b105" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hike_category_map" DROP CONSTRAINT "FK_b2808bfe75c291f56437458b105"`);
        await queryRunner.query(`ALTER TABLE "hike_category_map" DROP CONSTRAINT "FK_e6a31c064535fd09364a8505f74"`);
        await queryRunner.query(`ALTER TABLE "hike_tracks" DROP CONSTRAINT "FK_de48e81cc25f2351bf8f70f9a85"`);
        await queryRunner.query(`ALTER TABLE "hikes" DROP CONSTRAINT "FK_761d26c0878d1668effa3aa2c09"`);
        await queryRunner.query(`DROP TABLE "hike_category_map"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "hike_tracks"`);
        await queryRunner.query(`DROP TABLE "hikes"`);
    }

}
