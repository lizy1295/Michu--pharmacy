import { MigrationInterface, QueryRunner } from 'typeorm';

export class RetireDuplicateOrderStorage1789971000000 implements MigrationInterface {
  name = 'RetireDuplicateOrderStorage1789971000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasItemsCol = await queryRunner.hasColumn('orders', 'items');
    if (hasItemsCol) {
      // 1. Backfill legacy items from orders.items to order_items if order_items has no rows for the order
      await queryRunner.query(`
        DO $$
        DECLARE
          r RECORD;
          item jsonb;
        BEGIN
          FOR r IN SELECT "order_id", "items" FROM "orders" WHERE "items" IS NOT NULL AND jsonb_typeof("items") = 'array' AND jsonb_array_length("items") > 0 LOOP
            IF NOT EXISTS (SELECT 1 FROM "order_items" WHERE "order_id" = r.order_id) THEN
              FOR item IN SELECT * FROM jsonb_array_elements(r.items) LOOP
                INSERT INTO "order_items" ("order_id", "product_id", "quantity", "unit_price", "created_at", "updated_at")
                VALUES (
                  r.order_id,
                  COALESCE((item->>'id')::int, (item->>'productId')::int, (item->>'product_id')::int, 1),
                  COALESCE((item->>'quantity')::int, 1),
                  COALESCE((item->>'price')::numeric, 0),
                  now(),
                  now()
                );
              END LOOP;
            END IF;
          END LOOP;
        END $$;
      `);

      // 2. Drop the redundant orders.items column
      await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "items"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasItemsCol = await queryRunner.hasColumn('orders', 'items');
    if (!hasItemsCol) {
      await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN "items" jsonb`);

      // Re-populate orders.items from order_items
      await queryRunner.query(`
        UPDATE "orders" o
        SET "items" = COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', oi."product_id",
                'productId', oi."product_id",
                'quantity', oi."quantity",
                'price', oi."unit_price"
              )
            )
            FROM "order_items" oi
            WHERE oi."order_id" = o."order_id"
          ),
          '[]'::jsonb
        )
      `);
    }
  }
}
