import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration is intentionally idempotent.
 * The `advertisements` table may have already been created by TypeORM's
 * schema-synchronize (with snake_case column names). We use IF NOT EXISTS
 * and DROP NOT NULL guards so the migration succeeds in both states.
 */
export class CreateAdvertisementsTable1757400000000 implements MigrationInterface {
  name = 'CreateAdvertisementsTable1757400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the table if it doesn't exist yet (fresh environment)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "advertisements" (
        "id"            SERIAL PRIMARY KEY,
        "title"         VARCHAR(255)  NOT NULL DEFAULT '',
        "description"   TEXT,
        "media_type"    VARCHAR(20)   NOT NULL DEFAULT 'image',
        "media_url"     TEXT,
        "thumbnail_url" TEXT,
        "target_url"    TEXT,
        "target_page"   VARCHAR(100)  DEFAULT 'homepage',
        "position"      VARCHAR(100)  DEFAULT 'disease_solution',
        "display_order" INTEGER       NOT NULL DEFAULT 0,
        "start_date"    DATE,
        "end_date"      DATE,
        "status"        VARCHAR(20)   NOT NULL DEFAULT 'published',
        "created_by"    VARCHAR(255),
        "created_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);

    // 2. Ensure nullable columns are actually nullable in case the table
    //    was previously created by synchronize with NOT NULL constraints.
    await queryRunner.query(`ALTER TABLE "advertisements" ALTER COLUMN "media_url"  DROP NOT NULL`).catch(() => {/* already nullable */});
    await queryRunner.query(`ALTER TABLE "advertisements" ALTER COLUMN "start_date" DROP NOT NULL`).catch(() => {/* already nullable */});
    await queryRunner.query(`ALTER TABLE "advertisements" ALTER COLUMN "end_date"   DROP NOT NULL`).catch(() => {/* already nullable */});

    // 3. Seed the 4 initial advertisements (idempotent – ON CONFLICT DO NOTHING)
    await queryRunner.query(`
      INSERT INTO "advertisements"
        ("title","description","media_type","media_url","thumbnail_url","target_url","target_page","position","display_order","start_date","end_date","status","created_by")
      VALUES
        (
          'Clinical Video Guide: Modern Respiratory & Asthma Management Protocol',
          'Watch our clinical pharmacist team explain the 3-step preventive therapy for bronchial asthma, spacer usage, and when to seek instant nebulization at Michu branches.',
          'video',
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
          '/health?action=consult', 'homepage', 'disease_solution', 1,
          '2026-08-01', '2026-12-31', 'published', 'Dr. Helen Tadesse (MD, BCPS)'
        ),
        (
          'Seasonal Alert: Modern Pediatric Respiratory & Asthma Relief Solutions',
          'Comprehensive solutions for seasonal bronchial allergies and asthma flare-ups: portable nebulizers, spacer chambers, and pediatrician-verified syrups.',
          'image', NULL, NULL,
          '/products?category=Medicine', 'homepage', 'disease_solution', 2,
          '2026-08-10', '2026-12-31', 'published', 'Admin / Health Team'
        ),
        (
          'Product Innovation: Smart Continuous Blood Glucose Monitoring Kits',
          'Accurate instant readings with painless micro-sensors. Manage Type 1 and Type 2 diabetes with precision. Free battery replacement and lancets included.',
          'image', NULL, NULL,
          '/products?category=Medical Devices', 'homepage', 'product_news', 3,
          '2026-08-15', '2026-12-31', 'published', 'Admin / Pharmacy Lead'
        ),
        (
          'Special Promotion: Telebirr & CBE Birr Instant Checkout Discounts',
          'Enjoy 10% instant rebate on verified OTC supplements and skincare lines when paying with Telebirr SuperApp or Commercial Bank of Ethiopia CBE Birr.',
          'image', NULL, NULL,
          '/products', 'homepage', 'hero_banner', 4,
          '2026-08-01', '2026-12-31', 'published', 'Admin / Finance'
        )
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "advertisements"`);
  }
}
