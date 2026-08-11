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
  console.log('Connected to PostgreSQL database');

  console.log('Creating payments table if not exists...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS payments (
      payment_id SERIAL PRIMARY KEY,
      payment_number VARCHAR(50) NOT NULL UNIQUE,
      order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      payment_method VARCHAR(20) NOT NULL DEFAULT 'telebirr',
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
      provider_transaction_id VARCHAR(100),
      provider_reference VARCHAR(100),
      payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
      checkout_url TEXT,
      error_message TEXT,
      raw_payload JSONB,
      paid_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ payments table created / verified successfully');

  // Verify columns now
  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payments'
  `);
  console.log('Columns in payments table:', cols.rows.map(c => c.column_name));

  await client.end();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
