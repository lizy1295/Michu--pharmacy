import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1789966972055 implements MigrationInterface {
    name = 'InitialSchema1789966972055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "proof_image" text`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "transaction_id" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "proof_image" text`);
        await queryRunner.query(`ALTER TABLE "advertisements" ADD COLUMN IF NOT EXISTS "clicks" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "advertisements" ADD COLUMN IF NOT EXISTS "views" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "advertisements" DROP COLUMN IF EXISTS "views"`);
        await queryRunner.query(`ALTER TABLE "advertisements" DROP COLUMN IF EXISTS "clicks"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "proof_image"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "transaction_id"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "proof_image"`);
    }
}
