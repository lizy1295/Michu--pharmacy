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
  console.log('Connected to PostgreSQL');

  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  console.log('--- TABLES IN POSTGRESQL ---');
  console.log(tables.rows.map(r => r.table_name));

  for (const t of tables.rows) {
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [t.table_name]);
    console.log(`\nTable [${t.table_name}] Columns:`);
    console.log(cols.rows.map(c => `${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`).join(', '));
  }

  await client.end();
}

main().catch(console.error);
