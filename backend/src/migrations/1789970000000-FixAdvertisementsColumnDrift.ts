import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAdvertisementsColumnDrift1789970000000 implements MigrationInterface {
  name = 'FixAdvertisementsColumnDrift1789970000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnsToRename = [
      { old: 'mediaType', new: 'media_type' },
      { old: 'mediaUrl', new: 'media_url' },
      { old: 'thumbnailUrl', new: 'thumbnail_url' },
      { old: 'targetUrl', new: 'target_url' },
      { old: 'targetPage', new: 'target_page' },
      { old: 'displayOrder', new: 'display_order' },
      { old: 'startDate', new: 'start_date' },
      { old: 'endDate', new: 'end_date' },
      { old: 'createdBy', new: 'created_by' },
      { old: 'createdAt', new: 'created_at' },
      { old: 'updatedAt', new: 'updated_at' },
    ];

    for (const col of columnsToRename) {
      const hasOld = await queryRunner.hasColumn('advertisements', col.old);
      const hasNew = await queryRunner.hasColumn('advertisements', col.new);
      if (hasOld && !hasNew) {
        await queryRunner.renameColumn('advertisements', col.old, col.new);
      }
    }

    // Widen media_type to VARCHAR(20) to match entity definition if table exists
    const hasMediaType = await queryRunner.hasColumn('advertisements', 'media_type');
    if (hasMediaType) {
      await queryRunner.query(
        `ALTER TABLE "advertisements" ALTER COLUMN "media_type" TYPE VARCHAR(20)`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const columnsToRevert = [
      { old: 'media_type', new: 'mediaType' },
      { old: 'media_url', new: 'mediaUrl' },
      { old: 'thumbnail_url', new: 'thumbnailUrl' },
      { old: 'target_url', new: 'targetUrl' },
      { old: 'target_page', new: 'targetPage' },
      { old: 'display_order', new: 'displayOrder' },
      { old: 'start_date', new: 'startDate' },
      { old: 'end_date', new: 'endDate' },
      { old: 'created_by', new: 'createdBy' },
      { old: 'created_at', new: 'createdAt' },
      { old: 'updated_at', new: 'updatedAt' },
    ];

    for (const col of columnsToRevert) {
      const hasOld = await queryRunner.hasColumn('advertisements', col.old);
      const hasNew = await queryRunner.hasColumn('advertisements', col.new);
      if (hasOld && !hasNew) {
        await queryRunner.renameColumn('advertisements', col.old, col.new);
      }
    }
  }
}
