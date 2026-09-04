import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCertificationsToDoctor1725450000000 implements MigrationInterface {
  name = 'AddCertificationsToDoctor1725450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('doctors', 'certifications');
    if (!hasColumn) {
      await queryRunner.addColumn(
        'doctors',
        new TableColumn({
          name: 'certifications',
          type: 'text',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('doctors', 'certifications');
    if (hasColumn) {
      await queryRunner.dropColumn('doctors', 'certifications');
    }
  }
}
