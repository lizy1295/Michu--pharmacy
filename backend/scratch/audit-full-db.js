const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'MPH',
});

async function main() {
  await client.connect();
  console.log('=== POSTGRESQL DATABASE AUDIT ===');

  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log('Tables found:', tablesRes.rows.map(r => r.table_name));

  for (const table of tablesRes.rows) {
    const tableName = table.table_name;
    const countRes = await client.query(`SELECT count(*) FROM "${tableName}"`);
    console.log(`\n--- Table: ${tableName} (Rows: ${countRes.rows[0].count}) ---`);

    const colRes = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);

    console.table(colRes.rows);
  }

  await client.end();
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
