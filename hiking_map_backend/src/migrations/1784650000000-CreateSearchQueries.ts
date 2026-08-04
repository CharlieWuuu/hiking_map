import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSearchQueries1784650000000 implements MigrationInterface {
  name = 'CreateSearchQueries1784650000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "search_queries" ("id" SERIAL NOT NULL, "query" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_search_queries_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_search_queries_query" ON "search_queries" ("query")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_search_queries_query"`);
    await queryRunner.query(`DROP TABLE "search_queries"`);
  }
}
