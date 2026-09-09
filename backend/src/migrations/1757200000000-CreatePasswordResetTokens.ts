import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Password Reset — Create password_reset_tokens table.
 *
 * Rules:
 * - Stores only SHA-256 hashes of tokens — never plaintext.
 * - used_at IS NULL + expires_at > NOW() = valid token.
 * - Foreign key to users ON DELETE CASCADE — tokens die with the user.
 * - Safe IF NOT EXISTS guard — idempotent.
 */
export class CreatePasswordResetTokens1757200000000 implements MigrationInterface {
  name = 'CreatePasswordResetTokens1757200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
        "id"          SERIAL PRIMARY KEY,
        "user_id"     INTEGER NOT NULL,
        "token_hash"  VARCHAR(64) NOT NULL,
        "expires_at"  TIMESTAMP NOT NULL,
        "used_at"     TIMESTAMP NULL,
        "created_at"  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_prt_user_id"
          FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_prt_token_hash"
        ON "password_reset_tokens" ("token_hash");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_prt_user_id"
        ON "password_reset_tokens" ("user_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_tokens";`);
  }
}
