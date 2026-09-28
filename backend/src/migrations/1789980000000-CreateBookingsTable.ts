import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingsTable1789980000000 implements MigrationInterface {
  name = 'CreateBookingsTable1789980000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bookings" (
        "booking_id"      SERIAL NOT NULL,
        "customer_id"     INTEGER NOT NULL,
        "customer_name"   VARCHAR(120) NOT NULL,
        "customer_email"  VARCHAR(150) NOT NULL,
        "customer_phone"  VARCHAR(30),
        "doctor_id"       INTEGER,
        "doctor_name"     VARCHAR(120) NOT NULL,
        "requested_date"  VARCHAR(20) NOT NULL,
        "requested_time"  VARCHAR(20) NOT NULL,
        "reason"          TEXT NOT NULL,
        "status"          VARCHAR(20) NOT NULL DEFAULT 'pending',
        "admin_notes"     TEXT,
        "confirmed_at"    TIMESTAMP,
        "cancelled_at"    TIMESTAMP,
        "created_at"      TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bookings" PRIMARY KEY ("booking_id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_bookings_customer_id" ON "bookings" ("customer_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_bookings_doctor_id" ON "bookings" ("doctor_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_bookings_status" ON "bookings" ("status")`,
    );

    // FK → doctors (SET NULL so doctor deletions don't cascade to bookings)
    const hasFkDoctor = await queryRunner.query(
      `SELECT 1 FROM information_schema.table_constraints
       WHERE constraint_name = 'FK_bookings_doctor_id'`,
    );
    if (!hasFkDoctor || hasFkDoctor.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "bookings"
         ADD CONSTRAINT "FK_bookings_doctor_id"
         FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_doctor_id"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_doctor_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_customer_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings"`);
  }
}
