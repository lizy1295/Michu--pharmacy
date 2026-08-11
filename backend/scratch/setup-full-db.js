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
  console.log('--- SETTING UP COMPLETE POSTGRESQL DATABASE ---');

  // 1. Create USERS table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      username VARCHAR(50) UNIQUE,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      gender VARCHAR(20),
      date_of_birth DATE,
      profile_image TEXT,
      role_id INTEGER DEFAULT 1,
      role VARCHAR(50) DEFAULT 'customer',
      branch_id VARCHAR(50),
      email_verified BOOLEAN DEFAULT false,
      phone_verified BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Table "users" verified.');

  // 2. Create CATEGORIES table
  await client.query(`
    CREATE TABLE IF NOT EXISTS categories (
      category_id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'active',
      display_order INTEGER DEFAULT 0,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Table "categories" verified.');

  // 3. Create ORDERS table
  await client.query(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id SERIAL PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL,
      customer_name VARCHAR(100) NOT NULL,
      customer_email VARCHAR(150) NOT NULL,
      customer_phone VARCHAR(20) NOT NULL,
      shipping_address TEXT NOT NULL,
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
      tax NUMERIC(10,2) NOT NULL DEFAULT 0,
      delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
      total NUMERIC(10,2) NOT NULL DEFAULT 0,
      status VARCHAR(20) DEFAULT 'pending',
      payment_status VARCHAR(20) DEFAULT 'pending',
      payment_method VARCHAR(50),
      notes TEXT,
      approved_at TIMESTAMP,
      shipped_at TIMESTAMP,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Table "orders" verified.');

  // 4. Align PRESCRIPTIONS table schema
  await client.query(`
    ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_number VARCHAR(50);
    ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS patient_name VARCHAR(100);
    ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS patient_email VARCHAR(150);
    ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(100);
    ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS doctor_license VARCHAR(50);
    ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS image_url TEXT;
    ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  `);
  console.log('✅ Table "prescriptions" schema aligned.');

  // 5. Create NOTIFICATIONS table
  await client.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      link VARCHAR(255),
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Table "notifications" verified.');

  // 6. Create AUDIT_LOGS table
  await client.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      log_id SERIAL PRIMARY KEY,
      admin_email VARCHAR(150) NOT NULL,
      action VARCHAR(100) NOT NULL,
      entity VARCHAR(50) NOT NULL,
      entity_id VARCHAR(50),
      details JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Table "audit_logs" verified.');

  // 7. Seed Sample Categories if empty
  const catCountRes = await client.query('SELECT count(*) FROM categories');
  if (parseInt(catCountRes.rows[0].count, 10) === 0) {
    const categories = [
      { name: 'Medicines', slug: 'medicines', description: 'Prescription & Over-the-Counter medicines' },
      { name: 'Vitamins & Supplements', slug: 'vitamins-supplements', description: 'Immune boosters & daily nutrition' },
      { name: 'Cosmetics & Skin Care', slug: 'cosmetics-skincare', description: 'Personal skincare and beauty products' },
      { name: 'Medical Devices', slug: 'medical-devices', description: 'Nebulizers, monitors, and diagnostic tools' },
      { name: 'Personal Care', slug: 'personal-care', description: 'Hygiene and daily sanitizers' },
    ];

    for (const cat of categories) {
      await client.query(
        'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3)',
        [cat.name, cat.slug, cat.description]
      );
    }
    console.log('🌱 Categories seeded.');
  }

  // 8. Seed Sample Customer Users if empty
  const userCountRes = await client.query("SELECT count(*) FROM users WHERE role = 'customer'");
  if (parseInt(userCountRes.rows[0].count, 10) === 0) {
    const passHash = await bcrypt.hash('password123', 10);
    const customers = [
      { first: 'Abebe', last: 'Kebede', email: 'abebe@example.com', phone: '+251911000001' },
      { first: 'Sara', last: 'Tesfaye', email: 'sara@example.com', phone: '+251911000002' },
      { first: 'Marta', last: 'Alemu', email: 'marta@example.com', phone: '+251911000003' },
      { first: 'Dawit', last: 'Hailu', email: 'dawit@example.com', phone: '+251911000004' },
      { first: 'Bethlehem', last: 'Tadesse', email: 'bety@example.com', phone: '+251911000005' },
    ];

    for (const c of customers) {
      await client.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, phone, role, email_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, 'customer', true, true)`,
        [c.first, c.last, c.email, passHash, c.phone]
      );
    }
    console.log('🌱 Customer users seeded.');
  }

  // 9. Seed Sample Orders if empty
  const orderCountRes = await client.query('SELECT count(*) FROM orders');
  if (parseInt(orderCountRes.rows[0].count, 10) === 0) {
    const sampleOrders = [
      {
        num: 'ORD-0001', cid: 1, name: 'Abebe Kebede', email: 'abebe@example.com', phone: '+251911000001',
        addr: 'Bole, Addis Ababa', status: 'completed', payStatus: 'paid', payMethod: 'Chapa Telebirr',
        sub: 480.00, tax: 0.00, fee: 50.00, total: 530.00,
        items: JSON.stringify([{ productId: 1, name: '(Exedexe) Dextromethorphan syrup 120ml', price: 240, quantity: 2 }])
      },
      {
        num: 'ORD-0002', cid: 2, name: 'Sara Tesfaye', email: 'sara@example.com', phone: '+251911000002',
        addr: 'Kirkos, Addis Ababa', status: 'pending', payStatus: 'pending', payMethod: 'Cash on Delivery',
        sub: 1155.00, tax: 0.00, fee: 50.00, total: 1205.00,
        items: JSON.stringify([{ productId: 7, name: 'Actrapid 100iu/ml 10ml/vial soluble insulin', price: 1155, quantity: 1 }])
      },
      {
        num: 'ORD-0003', cid: 3, name: 'Marta Alemu', email: 'marta@example.com', phone: '+251911000003',
        addr: 'Jemo, Addis Ababa', status: 'approved', payStatus: 'paid', payMethod: 'CBE Birr',
        sub: 350.00, tax: 0.00, fee: 50.00, total: 400.00,
        items: JSON.stringify([{ productId: 9, name: 'Michu Daily Multi-Vitamin Capsules', price: 350, quantity: 1 }])
      },
    ];

    for (const o of sampleOrders) {
      await client.query(
        `INSERT INTO orders (order_number, customer_id, customer_name, customer_email, customer_phone, shipping_address, status, payment_status, payment_method, subtotal, tax, delivery_fee, total, items)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb)`,
        [o.num, o.cid, o.name, o.email, o.phone, o.addr, o.status, o.payStatus, o.payMethod, o.sub, o.tax, o.fee, o.total, o.items]
      );
    }
    console.log('🌱 Sample orders seeded.');
  }

  // 10. Seed Sample Prescriptions if empty
  const rxCountRes = await client.query('SELECT count(*) FROM prescriptions');
  if (parseInt(rxCountRes.rows[0].count, 10) === 0) {
    const sampleRx = [
      { num: 'RX-0001', name: 'Sara Tesfaye', email: 'sara@example.com', doc: 'Dr. Yonas', status: 'pending', url: '/uploads/prescriptions/sample-rx-1.pdf', notes: 'Need insulin refilled' },
      { num: 'RX-0002', name: 'Abebe Kebede', email: 'abebe@example.com', doc: 'Dr. Helen', status: 'approved', url: '/uploads/prescriptions/sample-rx-2.jpg', notes: 'Hypertension prescription approved' },
    ];

    for (const r of sampleRx) {
      await client.query(
        `INSERT INTO prescriptions (prescription_number, patient_name, patient_email, doctor_name, status, file_url, image_url, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $6, $7)`,
        [r.num, r.name, r.email, r.doc, r.status, r.url, r.notes]
      );
    }
    console.log('🌱 Sample prescriptions seeded.');
  }

  // 11. Seed Sample Admin Notifications if empty
  const notifCountRes = await client.query('SELECT count(*) FROM notifications');
  if (parseInt(notifCountRes.rows[0].count, 10) === 0) {
    const sampleNotifs = [
      { title: 'New Order Received', message: 'Order ORD-0002 placed by Sara Tesfaye requiring review.', type: 'order', link: '/admin/orders' },
      { title: 'Pending Prescription Upload', message: 'Prescription RX-0001 uploaded by Sara Tesfaye awaits approval.', type: 'prescription', link: '/admin/prescriptions' },
      { title: 'Low Stock Alert', message: 'Amoxicillin 500mg has reached low stock threshold (stock: 5).', type: 'inventory', link: '/admin/inventory' },
    ];

    for (const n of sampleNotifs) {
      await client.query(
        'INSERT INTO notifications (title, message, type, link) VALUES ($1, $2, $3, $4)',
        [n.title, n.message, n.type, n.link]
      );
    }
    console.log('🌱 Admin notifications seeded.');
  }

  await client.end();
  console.log('🎉 POSTGRESQL DATABASE SETUP COMPLETE!');
}

main().catch(err => {
  console.error('Database setup error:', err);
  process.exit(1);
});
