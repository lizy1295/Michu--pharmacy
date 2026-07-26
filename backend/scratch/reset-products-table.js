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

async function reset() {
  await client.connect();
  console.log('✅ Connected to PostgreSQL');

  // Show current columns on the products table (if it exists)
  const colRes = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products'
    ORDER BY ordinal_position;
  `);

  if (colRes.rows.length === 0) {
    console.log('ℹ️  No existing products table found — TypeORM will create it fresh.');
  } else {
    console.log('🔍 Existing products columns:', colRes.rows.map(r => r.column_name).join(', '));
    console.log('🗑️  Dropping old products table...');
    await client.query('DROP TABLE IF EXISTS products CASCADE;');
    console.log('✅ products table dropped. TypeORM will recreate it on next startup.');
  }

  await client.end();
}

reset().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
