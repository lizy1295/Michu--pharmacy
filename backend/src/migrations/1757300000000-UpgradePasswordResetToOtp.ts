import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Upgrade password reset to secure OTP flow:
 * - otp_hash: SHA-256 hash of the 6-digit OTP code (never plaintext)
 * - attempts: Counter for brute-force rate-limiting (max 3)
 * - reset_token_hash: SHA-256 hash of single-use reset token returned after OTP verification
 * - verified_at: Timestamp when OTP was successfully validated
 * - used_at: Timestamp when reset token was consumed to set the new password
 * - Foreign key cascade to users(user_id)
 */
export class UpgradePasswordResetToOtp1757300000000 implements MigrationInterface {
  name = 'UpgradePasswordResetToOtp1757300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_tokens";`);

    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id"               SERIAL PRIMARY KEY,
        "user_id"          INTEGER NOT NULL,
        "otp_hash"         VARCHAR(64) NOT NULL,
        "attempts"         INTEGER NOT NULL DEFAULT 0,
        "reset_token_hash" VARCHAR(64) NULL,
        "expires_at"       TIMESTAMP NOT NULL,
        "verified_at"      TIMESTAMP NULL,
        "used_at"          TIMESTAMP NULL,
        "created_at"       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_prt_user_id"
          FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_prt_user_id"
        ON "password_reset_tokens" ("user_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_prt_otp_hash"
        ON "password_reset_tokens" ("otp_hash");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_prt_reset_token_hash"
        ON "password_reset_tokens" ("reset_token_hash");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_tokens";`);
  }
}
