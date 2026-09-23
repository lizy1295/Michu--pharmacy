import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderItemsTable1757500000000 implements MigrationInterface {
  name = 'CreateOrderItemsTable1757500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id"          SERIAL NOT NULL,
        "order_id"    INTEGER NOT NULL,
        "product_id"  INTEGER NOT NULL,
        "quantity"    INTEGER NOT NULL DEFAULT 1,
        "unit_price"  NUMERIC(10,2) NOT NULL,
        "created_at"  TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_order_items_order_id" ON "order_items" ("order_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_order_items_product_id" ON "order_items" ("product_id")`,
    );

    // FK → orders
    const hasFkOrder = await queryRunner.query(
      `SELECT 1 FROM information_schema.table_constraints
       WHERE constraint_name = 'FK_order_items_order_id'`,
    );
    if (!hasFkOrder || hasFkOrder.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "order_items"
         ADD CONSTRAINT "FK_order_items_order_id"
         FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }

    // FK → products
    const hasFkProduct = await queryRunner.query(
      `SELECT 1 FROM information_schema.table_constraints
       WHERE constraint_name = 'FK_order_items_product_id'`,
    );
    if (!hasFkProduct || hasFkProduct.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "order_items"
         ADD CONSTRAINT "FK_order_items_product_id"
         FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "FK_order_items_product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "FK_order_items_order_id"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_order_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
  }
}
