const http = require('http');

async function testNextAdminLogin() {
  console.log('🧪 Testing Next.js Frontend Admin Login Route (http://localhost:3000/api/auth/admin/login)...');
  
  const postData = JSON.stringify({
    email: 'admin@michupharmacy.com',
    password: 'password123',
  });

  const req = http.request(
    'http://localhost:3000/api/auth/admin/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    },
    (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        try {
          const json = JSON.parse(data);
          console.log('Response JSON:', {
            hasAccessToken: !!json.accessToken,
            adminRole: json.admin?.role,
            adminEmail: json.admin?.email,
          });
          if (json.accessToken && json.accessToken.startsWith('eyJ')) {
            console.log('✅ Next.js Admin Login Route returned valid signed JWT!');
          } else {
            console.log('❌ Unexpected response structure:', json);
          }
        } catch (e) {
          console.log('Raw output:', data);
        }
      });
    }
  );

  req.on('error', (err) => {
    console.error('Request error:', err.message);
  });

  req.write(postData);
  req.end();
}

testNextAdminLogin();
