const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'MPH',
});

console.log('Attempting to connect to PostgreSQL...');
console.log(`Host: ${client.host}`);
console.log(`Port: ${client.port}`);
console.log(`User: ${client.user}`);
console.log(`Database: ${client.database}`);

client.connect()
  .then(() => {
    console.log('✅ Connection successful!');
    return client.query('SELECT version();');
  })
  .then(res => {
    console.log('Server version:', res.rows[0].version);
    return client.end();
  })
  .catch(err => {
    console.error('❌ Connection failed!');
    console.error('Error Details:', err);
    process.exit(1);
  });
