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

  const passwordHash = await bcrypt.hash('password123', 10);

  const adminAccounts = [
    {
      email: 'admin@michupharmacy.com',
      role: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+251-911-000-000',
    },
    {
      email: 'superadmin@michupharmacy.com',
      role: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+251-911-111-111',
    },
    {
      email: 'pharmacist@michupharmacy.com',
      role: 'pharmacist',
      firstName: 'Lead',
      lastName: 'Pharmacist',
      phone: '+251-911-222-222',
    },
  ];

  for (const acc of adminAccounts) {
    // Check in users table
    const existingUser = await client.query('SELECT user_id, email FROM users WHERE email = $1', [acc.email]);
    if (existingUser.rows.length > 0) {
      await client.query(
        'UPDATE users SET password_hash = $1, role = $2, is_active = true, email_verified = true WHERE email = $3',
        [passwordHash, acc.role, acc.email]
      );
      console.log(`✅ Updated user account in users table: ${acc.email} (${acc.role})`);
    } else {
      await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, role_id, phone, is_active, email_verified)
         VALUES ($1, $2, $3, $4, $5, 2, $6, true, true)`,
        [acc.email, passwordHash, acc.firstName, acc.lastName, acc.role, acc.phone]
      );
      console.log(`✅ Created user account in users table: ${acc.email} (${acc.role})`);
    }

    // Check in admins table
    const existingAdmin = await client.query('SELECT admin_id, email FROM admins WHERE email = $1', [acc.email]);
    if (existingAdmin.rows.length > 0) {
      await client.query(
        'UPDATE admins SET password_hash = $1, role = $2, is_active = true WHERE email = $3',
        [passwordHash, acc.role, acc.email]
      );
      console.log(`✅ Updated admin record in admins table: ${acc.email}`);
    } else {
      await client.query(
        `INSERT INTO admins (email, password_hash, full_name, role, phone, is_active)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [acc.email, passwordHash, `${acc.firstName} ${acc.lastName}`, acc.role, acc.phone]
      );
      console.log(`✅ Created admin record in admins table: ${acc.email}`);
    }
  }

  console.log('✅ All admin accounts seeded successfully!');
  await client.end();
}

main().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
