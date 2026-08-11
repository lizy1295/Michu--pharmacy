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
  console.log('Connected to database');

  console.log('Migrating products table schema: adding status column...');
  await client.query(`
    ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
  `);
  console.log('✅ products table migrated successfully');

  // Verify columns now
  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products'
  `);
  console.log('Updated columns in products:', cols.rows.map(c => c.column_name));

  await client.end();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
