import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingAuditIndexes1789972000000 implements MigrationInterface {
  name = 'AddMissingAuditIndexes1789972000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. orders: customer_id, status, payment_status
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_orders_customer_id" ON "orders" ("customer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_orders_status" ON "orders" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_orders_payment_status" ON "orders" ("payment_status")`,
    );

    // 2. payments: order_id
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payments_order_id" ON "payments" ("order_id")`,
    );

    // 3. products: category, brand
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_category" ON "products" ("category")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_brand" ON "products" ("brand")`,
    );

    // 4. inquiries: status
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_inquiries_status" ON "inquiries" ("status")`,
    );

    // 5. prescriptions: patient_email
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_prescriptions_patient_email" ON "prescriptions" ("patient_email")`,
    );

    // 6. users: role, branch_id
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_users_role" ON "users" ("role")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_users_branch_id" ON "users" ("branch_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_branch_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_prescriptions_patient_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_inquiries_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_brand"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_payment_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_customer_id"`);
  }
}
