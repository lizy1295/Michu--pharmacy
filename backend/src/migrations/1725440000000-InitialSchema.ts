import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1725440000000 implements MigrationInterface {
  name = 'InitialSchema1725440000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "products" ("product_id" SERIAL NOT NULL, "product_name" character varying(150) NOT NULL, "price_etb" numeric(10,2) NOT NULL, "brand" character varying(150), "category" character varying(50), "requires_prescription" boolean NOT NULL DEFAULT false, "stock_quantity" integer NOT NULL DEFAULT '0', "description" text, "image_url" text, "attributes" jsonb, "status" character varying(20) NOT NULL DEFAULT 'active', "expiry_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a8940a4bf3b90bd7ac15c8f4dd9" PRIMARY KEY ("product_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_894a8151f2433fca9b81acb297" ON "products" ("product_name") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "doctors" ("id" SERIAL NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "specialization" character varying(100) NOT NULL, "experienceYears" integer NOT NULL DEFAULT '0', "contactEmail" character varying(255) NOT NULL, "contactPhone" character varying(50), "bio" text, "languages" text, "certifications" text, "imageUrl" character varying, "status" character varying NOT NULL DEFAULT 'active', "availableForConsultation" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2558fa7f53dc59264381245f3f2" UNIQUE ("contactEmail"), CONSTRAINT "PK_8207e7889b50ee3695c2b8154ff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "users" ("user_id" SERIAL NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "username" character varying(50), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "phone" character varying(20), "gender" character varying(20), "date_of_birth" date, "profile_image" text, "role_id" integer NOT NULL DEFAULT '1', "role" character varying(50) NOT NULL DEFAULT 'customer', "branch_id" character varying(50), "email_verified" boolean NOT NULL DEFAULT false, "phone_verified" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "last_login" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_ef2fb839248017665e5033e730" ON "users" ("first_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_0408cb491623b121499d4fa238" ON "users" ("last_name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "address" character varying(500), "city" character varying(50), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_9c06cbb83feb2f0be6263bd47e" ON "branches" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "prescriptions" ("prescription_id" SERIAL NOT NULL, "prescription_number" character varying(50) NOT NULL, "patient_name" character varying(100) NOT NULL, "patient_email" character varying(150) NOT NULL, "doctor_name" character varying(100), "doctor_license" character varying(50), "status" character varying(30) NOT NULL DEFAULT 'pending', "image_url" text NOT NULL, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d234a398a58d401c4cf7c5951d9" UNIQUE ("prescription_number"), CONSTRAINT "PK_88ae21471f1463e211b485dc205" PRIMARY KEY ("prescription_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "orders" ("order_id" SERIAL NOT NULL, "order_number" character varying(50) NOT NULL, "customer_id" integer NOT NULL, "customer_name" character varying(100) NOT NULL, "customer_email" character varying(150) NOT NULL, "customer_phone" character varying(20) NOT NULL, "shipping_address" text NOT NULL, "items" jsonb NOT NULL, "subtotal" numeric(10,2) NOT NULL, "tax" numeric(10,2) NOT NULL DEFAULT '0', "delivery_fee" numeric(10,2) NOT NULL DEFAULT '0', "total" numeric(10,2) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "payment_status" character varying(20) NOT NULL DEFAULT 'pending', "payment_method" character varying(50), "notes" text, "approved_at" TIMESTAMP, "shipped_at" TIMESTAMP, "completed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_75eba1c6b1a66b09f2a97e6927b" UNIQUE ("order_number"), CONSTRAINT "PK_cad55b3cb25b38be94d2ce831db" PRIMARY KEY ("order_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "payments" ("payment_id" SERIAL NOT NULL, "payment_number" character varying(50) NOT NULL, "order_id" integer NOT NULL, "payment_method" character varying(20) NOT NULL DEFAULT 'telebirr', "amount" numeric(10,2) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'ETB', "provider_transaction_id" character varying(100), "provider_reference" character varying(100), "payment_status" character varying(30) NOT NULL DEFAULT 'PENDING', "checkout_url" text, "error_message" text, "raw_payload" jsonb, "paid_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_37f40df34aab6084881c0ceebdc" UNIQUE ("payment_number"), CONSTRAINT "PK_8866a3cfff96b8e17c2b204aae0" PRIMARY KEY ("payment_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "inquiries" ("inquiry_id" SERIAL NOT NULL, "customer_name" character varying(100) NOT NULL, "customer_email" character varying(150) NOT NULL, "customer_phone" character varying(30), "message" text NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'open', "staff_reply" text, "replied_by" character varying(100), "replied_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_701dc235121d63d6119d3d2e003" PRIMARY KEY ("inquiry_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "categories" ("category_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "slug" character varying(100) NOT NULL, "description" text, "status" character varying(20) NOT NULL DEFAULT 'active', "display_order" integer NOT NULL DEFAULT '0', "image_url" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_51615bef2cea22812d0dcab6e18" PRIMARY KEY ("category_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenHash" character varying(512) NOT NULL, "user_id" integer NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "isRevoked" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_c25bc63d248ca90e8dcc1d92d0" ON "refresh_tokens" ("tokenHash") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "admins" ("admin_id" SERIAL NOT NULL, "email" character varying(150) NOT NULL, "password_hash" character varying(255) NOT NULL, "full_name" character varying(100) NOT NULL, "role" character varying(20) NOT NULL DEFAULT 'staff', "phone" character varying(20), "avatar_url" text, "last_login_at" TIMESTAMP, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_051db7d37d478a69a7432df1479" UNIQUE ("email"), CONSTRAINT "PK_88070d08be64522fc84fdefef85" PRIMARY KEY ("admin_id"))`,
    );

    const hasFkOrder = await queryRunner.query(
      `SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_b2f7b823a21562eeca20e72b006'`,
    );
    if (!hasFkOrder || hasFkOrder.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "payments" ADD CONSTRAINT "FK_b2f7b823a21562eeca20e72b006" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }

    const hasFkUser = await queryRunner.query(
      `SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_3ddc983c5f7bcf132fd8732c3f4'`,
    );
    if (!hasFkUser || hasFkUser.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "FK_b2f7b823a21562eeca20e72b006"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "admins"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_c25bc63d248ca90e8dcc1d92d0"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inquiries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "prescriptions"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_9c06cbb83feb2f0be6263bd47e"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "branches"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_fe0bb3f6520ee0469504521e71"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_0408cb491623b121499d4fa238"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_ef2fb839248017665e5033e730"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "doctors"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_894a8151f2433fca9b81acb297"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
  }
}
