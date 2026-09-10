import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeEmailNullable1725550000000 implements MigrationInterface {
  name = 'MakeEmailNullable1725550000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing NOT NULL constraint and unique index on email
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore NOT NULL (only safe if all rows have a non-null email)
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`,
    );
  }
}
