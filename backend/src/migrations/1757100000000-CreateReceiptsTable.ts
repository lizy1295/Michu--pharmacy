import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 4 — Create receipts table.
 *
 * Rules:
 * - Drops zero-column empty shell if present from previous failed DDL.
 * - Creates receipts table with full schema.
 * - Unique constraint on receipt_number and order_id (prevents duplicate receipts).
 * - Safe foreign keys to orders and payments.
 * - Zero data loss.
 */
export class CreateReceiptsTable1757100000000 implements MigrationInterface {
  name = 'CreateReceiptsTable1757100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // If an empty 0-column table shell exists, drop it safely
    const existingCols = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts'
    `);
    if (!existingCols || existingCols.length === 0) {
      await queryRunner.query(`DROP TABLE IF EXISTS "receipts" CASCADE;`);
    }

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "receipts" (
        "receipt_id" SERIAL PRIMARY KEY,
        "receipt_number" VARCHAR(50) NOT NULL UNIQUE,
        "order_id" INTEGER NOT NULL UNIQUE,
        "payment_id" INTEGER NOT NULL,
        "amount" DECIMAL(10, 2) NOT NULL,
        "currency" VARCHAR(10) NOT NULL DEFAULT 'ETB',
        "payment_method" VARCHAR(30) NOT NULL,
        "customer_name" VARCHAR(100) NOT NULL,
        "customer_email" VARCHAR(150) NOT NULL,
        "customer_phone" VARCHAR(50) NULL,
        "items" JSONB NOT NULL,
        "subtotal" DECIMAL(10, 2) NOT NULL,
        "tax" DECIMAL(10, 2) NOT NULL DEFAULT 0,
        "delivery_fee" DECIMAL(10, 2) NOT NULL DEFAULT 0,
        "total" DECIMAL(10, 2) NOT NULL,
        "issued_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_receipts_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_receipts_payment_id" FOREIGN KEY ("payment_id") REFERENCES "payments"("payment_id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_receipts_receipt_number" ON "receipts" ("receipt_number");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_receipts_order_id" ON "receipts" ("order_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_receipts_payment_id" ON "receipts" ("payment_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "receipts";`);
  }
}
