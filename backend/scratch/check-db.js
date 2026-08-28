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

async function check() {
  await client.connect();
  console.log('Connected to DB');
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables:', tables.rows.map(r => r.table_name));
  try {
    const users = await client.query('SELECT user_id, email, role, role_id, is_active FROM users');
    console.log('Users in users table:', users.rows);
  } catch (e) {
    console.log('Error querying users:', e.message);
  }
  try {
    const admins = await client.query('SELECT admin_id, email, role, is_active FROM admins');
    console.log('Admins in admins table:', admins.rows);
  } catch (e) {
    console.log('Error querying admins:', e.message);
  }
  await client.end();
}
check().catch(console.error);
