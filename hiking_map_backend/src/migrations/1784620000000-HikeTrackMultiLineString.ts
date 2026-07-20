import { MigrationInterface, QueryRunner } from "typeorm";

export class HikeTrackMultiLineString1784620000000 implements MigrationInterface {
    name = 'HikeTrackMultiLineString1784620000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hike_tracks" ALTER COLUMN "geom" TYPE geometry(MultiLineString,4326) USING ST_Multi("geom")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hike_tracks" ALTER COLUMN "geom" TYPE geometry(LineString,4326) USING ST_LineMerge("geom")`);
    }

}
