const http = require('http');

const API_BASE = 'http://localhost:3001/api/v1';

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting End-to-End Admin Flow Verification...\n');

  // Test 1: Login via /admins/auth/login
  console.log('1. Testing Admin Login (admin@michupharmacy.com)...');
  const loginRes = await request('POST', '/admins/auth/login', {
    email: 'admin@michupharmacy.com',
    password: 'password123',
  });
  console.log('   Status:', loginRes.status);
  if ((loginRes.status !== 200 && loginRes.status !== 201) || !loginRes.body.accessToken) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.body));
  }

  const adminToken = loginRes.body.accessToken;
  console.log('   ✅ Received valid JWT Access Token for role:', loginRes.body.admin?.role);

  // Test 2: Login via /auth/login
  console.log('\n2. Testing Superadmin Login via /auth/login (superadmin@michupharmacy.com)...');
  const userLoginRes = await request('POST', '/auth/login', {
    email: 'superadmin@michupharmacy.com',
    password: 'password123',
  });
  console.log('   Status:', userLoginRes.status);
  if (userLoginRes.status !== 200 || !userLoginRes.body.tokens?.accessToken) {
    throw new Error('User login failed: ' + JSON.stringify(userLoginRes.body));
  }
  const superadminToken = userLoginRes.body.tokens.accessToken;
  console.log('   ✅ Received valid JWT Access Token for role:', userLoginRes.body.user?.role);

  // Test 3: Create a Product using the Admin JWT Token
  console.log('\n3. Testing Product Creation as Admin (POST /products)...');
  const testProduct = {
    name: 'Test Amoxicillin 500mg - ' + Date.now(),
    brand: 'Michu Labs',
    category: 'Medicines',
    price: 150.5,
    stock: 75,
    prescriptionRequired: true,
    status: 'active',
    description: 'Antibiotic capsule for bacterial infections',
  };
  const createRes = await request('POST', '/products', testProduct, adminToken);
  console.log('   Status:', createRes.status);
  if (createRes.status !== 201) {
    throw new Error('Product creation failed: ' + JSON.stringify(createRes.body));
  }
  const createdProductId = createRes.body.id;
  console.log('   ✅ Product successfully created with ID:', createdProductId, 'Name:', createRes.body.name);

  // Test 4: Update the Product using Superadmin JWT Token
  console.log('\n4. Testing Product Update (PATCH /products/:id)...');
  const updateRes = await request('PATCH', `/products/${createdProductId}`, {
    price: 165.0,
    stock: 80,
  }, superadminToken);
  console.log('   Status:', updateRes.status);
  if (updateRes.status !== 200) {
    throw new Error('Product update failed: ' + JSON.stringify(updateRes.body));
  }
  console.log('   ✅ Product updated successfully. New price:', updateRes.body.price);

  // Test 5: Delete the Product using Admin JWT Token
  console.log('\n5. Testing Product Deletion (DELETE /products/:id)...');
  const deleteRes = await request('DELETE', `/products/${createdProductId}`, null, adminToken);
  console.log('   Status:', deleteRes.status);
  if (deleteRes.status !== 200) {
    throw new Error('Product deletion failed: ' + JSON.stringify(deleteRes.body));
  }
  console.log('   ✅ Product deleted successfully:', deleteRes.body);

  // Test 6: Verify unauthorized product creation without token is blocked
  console.log('\n6. Testing Unauthorized Product Creation without Token...');
  const unauthorizedRes = await request('POST', '/products', testProduct);
  console.log('   Status:', unauthorizedRes.status);
  if (unauthorizedRes.status === 401) {
    console.log('   ✅ Unauthenticated request correctly blocked (401 Unauthorized)');
  } else {
    throw new Error('Expected 401 but got ' + unauthorizedRes.status);
  }

  console.log('\n🎉 ALL TESTS PASSED! The Admin Auth & Product Management flow is 100% verified.');
}

runTests().catch(err => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
