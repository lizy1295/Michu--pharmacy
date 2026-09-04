import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { AddCertificationsToDoctor1725450000000 } from '../migrations/1725450000000-AddCertificationsToDoctor';

async function run() {
  console.log('Initializing DataSource for Migration Execution...');
  AppDataSource.setOptions({
    migrations: [AddCertificationsToDoctor1725450000000],
  });

  await AppDataSource.initialize();
  console.log('Database connected successfully!');

  console.log('Running pending migrations...');
  const migrations = await AppDataSource.runMigrations();
  if (migrations.length === 0) {
    console.log('No pending migrations to run. Schema is already up to date!');
  } else {
    console.log(`Successfully executed ${migrations.length} migration(s):`);
    for (const m of migrations) {
      console.log(`  ✓ ${m.name}`);
    }
  }

  // Verify the column in doctors table
  const queryRunner = AppDataSource.createQueryRunner();
  const hasCertifications = await queryRunner.hasColumn('doctors', 'certifications');
  console.log(`\nVerification: Column 'certifications' exists on 'doctors' table: ${hasCertifications ? 'YES (VERIFIED)' : 'NO'}`);
  await queryRunner.release();

  await AppDataSource.destroy();
  console.log('Migration process completed.');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
