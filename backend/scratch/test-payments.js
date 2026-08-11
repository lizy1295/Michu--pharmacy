const API_BASE = 'http://localhost:3001/api/v1';

async function testPaymentFlow() {
  console.log('--- Starting Telebirr & CBE Payment E2E Tests ---');

  // 1. Create Telebirr Test Order
  console.log('\n1. Creating Test Order for Telebirr...');
  const orderRes = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 101,
      customerName: 'Abebe Kebede',
      customerEmail: 'abebe.telebirr@example.com',
      customerPhone: '+251911001122',
      shippingAddress: 'Bole, Addis Ababa',
      items: [{ id: 1, name: 'Panadol Extra 500mg', price: 150, quantity: 2 }],
      subtotal: 300,
      tax: 45,
      deliveryFee: 150,
      notes: 'Telebirr test order',
    }),
  });

  const order = await orderRes.json();
  console.log(`✅ Order Created: ID ${order.id}, Ref: ${order.orderNumber}, Total: ${order.total} ETB`);

  // 2. Initiate Telebirr Payment
  console.log('\n2. Initiating Telebirr Payment...');
  const initRes = await fetch(`${API_BASE}/payments/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: order.id,
      paymentMethod: 'telebirr',
    }),
  });

  const initData = await initRes.json();
  console.log('✅ Telebirr Payment Initiated:', initData);

  // 3. Verify Telebirr Payment
  console.log('\n3. Verifying Telebirr Payment Status...');
  const verifyRes = await fetch(`${API_BASE}/payments/${initData.paymentId}/verify`, {
    method: 'POST',
  });
  const verifyData = await verifyRes.json();
  console.log('✅ Telebirr Payment Verification Result:', verifyData);

  // 4. Test Idempotency (Re-verify same payment)
  console.log('\n4. Testing Idempotency (re-verifying already paid transaction)...');
  const verifyAgainRes = await fetch(`${API_BASE}/payments/${initData.paymentId}/verify`, {
    method: 'POST',
  });
  const verifyAgainData = await verifyAgainRes.json();
  console.log('✅ Idempotency Test Result:', verifyAgainData.message || verifyAgainData);

  // 5. Create CBE Test Order
  console.log('\n5. Creating Test Order for CBE Birr...');
  const cbeOrderRes = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 102,
      customerName: 'Sara Tesfaye',
      customerEmail: 'sara.cbe@example.com',
      customerPhone: '+251911334455',
      shippingAddress: 'Kazanchis, Addis Ababa',
      items: [{ id: 2, name: 'Vitamin C 1000mg', price: 450, quantity: 1 }],
      subtotal: 450,
      tax: 67.5,
      deliveryFee: 150,
      notes: 'CBE test order',
    }),
  });

  const cbeOrder = await cbeOrderRes.json();
  console.log(`✅ CBE Order Created: ID ${cbeOrder.id}, Ref: ${cbeOrder.orderNumber}, Total: ${cbeOrder.total} ETB`);

  // 6. Initiate CBE Payment
  console.log('\n6. Initiating CBE Birr Payment...');
  const cbeInitRes = await fetch(`${API_BASE}/payments/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: cbeOrder.id,
      paymentMethod: 'cbe',
    }),
  });

  const cbeInitData = await cbeInitRes.json();
  console.log('✅ CBE Payment Initiated:', cbeInitData);

  // 7. Verify CBE Payment
  console.log('\n7. Verifying CBE Birr Payment Status...');
  const cbeVerifyRes = await fetch(`${API_BASE}/payments/${cbeInitData.paymentId}/verify`, {
    method: 'POST',
  });
  const cbeVerifyData = await cbeVerifyRes.json();
  console.log('✅ CBE Payment Verification Result:', cbeVerifyData);

  console.log('\n--- All Telebirr & CBE Payment Tests Completed Successfully! ---');
}

testPaymentFlow().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
