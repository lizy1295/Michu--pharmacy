const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');

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
  console.log('✅ Connected to database');

  console.log('Creating admins table if not exists...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS admins (
      admin_id SERIAL PRIMARY KEY,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      role VARCHAR(20) DEFAULT 'staff' NOT NULL,
      phone VARCHAR(20),
      avatar_url TEXT,
      last_login_at TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);
  console.log('✅ admins table created/verified');

  const passwordHash = await bcrypt.hash('password123', 10);
  const existingAdmin = await client.query('SELECT * FROM admins WHERE email = $1', ['admin@michupharmacy.com']);

  if (existingAdmin.rows.length === 0) {
    await client.query(`
      INSERT INTO admins (email, password_hash, full_name, role, phone, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, ['admin@michupharmacy.com', passwordHash, 'Super Admin', 'super_admin', '+251-911-000-000', true]);
    console.log('✅ Superadmin user admin@michupharmacy.com created successfully');
  } else {
    console.log('ℹ️ Superadmin user admin@michupharmacy.com already exists');
  }

  await client.end();
}

main().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
