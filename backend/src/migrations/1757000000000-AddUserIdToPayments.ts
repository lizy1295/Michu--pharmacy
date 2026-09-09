import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 2 — Add user_id FK to payments table.
 *
 * Safe migration rules:
 * - Column is nullable → all existing rows remain valid.
 * - Uses ADD COLUMN IF NOT EXISTS → idempotent on re-run.
 * - Foreign key is added only when missing → safe for environments
 *   that already ran this manually.
 * - Does NOT drop, truncate, or modify any existing column or table.
 */
export class AddUserIdToPayments1757000000000 implements MigrationInterface {
  name = 'AddUserIdToPayments1757000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add nullable user_id column to payments (idempotent)
    await queryRunner.query(`
      ALTER TABLE "payments"
        ADD COLUMN IF NOT EXISTS "user_id" INTEGER NULL
    `);

    // 2. Add FK to users table only if it doesn't already exist
    const hasFk = await queryRunner.query(`
      SELECT 1
      FROM information_schema.table_constraints
      WHERE constraint_name = 'FK_payments_user_id'
        AND table_name = 'payments'
    `);

    if (!hasFk || hasFk.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "payments"
          ADD CONSTRAINT "FK_payments_user_id"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("user_id")
          ON DELETE SET NULL
          ON UPDATE NO ACTION
      `);
    }

    // 3. Index to speed up lookups by user_id (idempotent)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_payments_user_id"
        ON "payments" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_payments_user_id"`);
    await queryRunner.query(`
      ALTER TABLE "payments"
        DROP CONSTRAINT IF EXISTS "FK_payments_user_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "payments"
        DROP COLUMN IF EXISTS "user_id"
    `);
  }
}
