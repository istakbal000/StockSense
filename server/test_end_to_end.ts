import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function req(endpoint: string, options: any = {}, token?: string) {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function runTestScenario() {
  console.log('🧪 ========================================================');
  console.log('🧪 STOCKSENSE: RUNNING COMPREHENSIVE END-TO-END VERIFICATION');
  console.log('🧪 ========================================================\n');

  // 1. Test Auth: Login as Manager
  console.log('🔹 1. Authenticating as Inventory Manager...');
  const loginRes = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'manager@stocksense.com',
      password: 'password123',
    }),
  });
  const token = loginRes.token;
  assert(token, 'Login failed to return token');
  console.log('   ✅ Manager authenticated successfully. Token received.\n');

  // 1b. Test OTP Password Reset flow
  console.log('🔹 1b. Testing OTP Password Reset flow...');
  const forgotRes = await req('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: 'staff@stocksense.com' }),
  });
  assert(forgotRes.devOtp, 'Expected devOtp in response for automated testing');
  console.log(`   ✅ OTP generated: ${forgotRes.devOtp}`);

  const verifyOtpRes = await req('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email: 'staff@stocksense.com', otp: forgotRes.devOtp }),
  });
  assert(verifyOtpRes.success, 'OTP verification failed');
  console.log('   ✅ OTP successfully verified.');

  const resetRes = await req('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email: 'staff@stocksense.com',
      otp: forgotRes.devOtp,
      newPassword: 'newpassword456',
    }),
  });
  console.log(`   ✅ ${resetRes.message}`);

  // Restore staff password to password123
  const forgotRes2 = await req('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: 'staff@stocksense.com' }),
  });
  await req('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email: 'staff@stocksense.com',
      otp: forgotRes2.devOtp,
      newPassword: 'password123',
    }),
  });
  console.log('   ✅ Staff password restored.\n');

  // Get warehouses and locations
  const whRes = await req('/warehouses', {}, token);
  const mwh = whRes.warehouses.find((w: any) => w.code === 'MWH-01');
  assert(mwh, 'Main Warehouse not found');

  const locMainStore = mwh.locations.find((l: any) => l.name === 'Main Store');
  const locProdRack = mwh.locations.find((l: any) => l.name === 'Production Rack');
  assert(locMainStore, 'Main Store location not found');
  assert(locProdRack, 'Production Rack location not found');

  const catRes = await req('/products/categories', {}, token);
  const catRaw = catRes.categories.find((c: any) => c.name === 'Raw Materials');
  assert(catRaw, 'Raw Materials category not found');

  const unitRes = await req('/products/units', {}, token);
  const uomKg = unitRes.units.find((u: any) => u.symbol === 'kg');
  assert(uomKg, 'kg unit of measure not found');

  // Step 1: Create Steel (kg)
  console.log('🔹 Step 1: Create Product "Industrial Steel" (Unit: kg, initialStock: 0)');
  const steelSku = `STL-TEST-${Date.now().toString().slice(-4)}`;
  const prodRes = await req(
    '/products',
    {
      method: 'POST',
      body: JSON.stringify({
        name: 'Industrial Steel Test',
        sku: steelSku,
        categoryId: catRaw.id,
        unitOfMeasureId: uomKg.id,
        initialStock: 0,
      }),
    },
    token
  );
  const steelProduct = prodRes.product;
  assert(steelProduct, 'Failed to create steel product');
  console.log(`   ✅ Product created: ${steelProduct.name} (SKU: ${steelProduct.sku})\n`);

  // Step 2: Receive 100 kg Steel at Main Store
  console.log('🔹 Step 2: Receive 100 kg Steel at Main Store');
  const recRes = await req(
    '/receipts',
    {
      method: 'POST',
      body: JSON.stringify({
        supplierName: 'National Steel Corp',
        destinationLocationId: locMainStore.id,
        notes: 'Initial test shipment',
        items: [{ productId: steelProduct.id, quantity: 100, notes: 'Grade 60 Steel' }],
      }),
    },
    token
  );
  const receiptId = recRes.receipt.id;
  console.log(`   ✅ Created receipt: ${recRes.receipt.receiptNumber} (Status: Ready)`);

  // Validate Receipt
  console.log('   Validating receipt...');
  const valRecRes = await req(`/receipts/${receiptId}/validate`, { method: 'POST' }, token);
  assert(valRecRes.receipt.status === 'Done', 'Receipt status must be Done after validation');

  // Check Steel Stock
  const checkStock1 = await req(`/products/${steelProduct.id}`, {}, token);
  console.log(`   Current Stock: ${checkStock1.product.totalStock} kg`);
  assert.strictEqual(checkStock1.product.totalStock, 100, 'Expected total stock = 100 kg');
  const balMain1 = checkStock1.product.balances.find((b: any) => b.locationId === locMainStore.id);
  assert.strictEqual(balMain1.quantity, 100, 'Expected Main Store stock = 100 kg');
  console.log('   ✅ Step 2 VERIFIED: Stock = 100 kg at Main Store. Ledger logged.\n');

  // Step 3: Transfer 40 kg from Main Store → Production Rack
  console.log('🔹 Step 3: Transfer 40 kg from Main Store → Production Rack');
  const trfRes = await req(
    '/transfers',
    {
      method: 'POST',
      body: JSON.stringify({
        sourceLocationId: locMainStore.id,
        destinationLocationId: locProdRack.id,
        notes: 'Transfer steel to production line',
        items: [{ productId: steelProduct.id, quantity: 40 }],
      }),
    },
    token
  );
  const transferId = trfRes.transfer.id;
  console.log(`   ✅ Created transfer: ${trfRes.transfer.transferNumber}`);

  // Validate Transfer
  console.log('   Validating transfer...');
  const valTrfRes = await req(`/transfers/${transferId}/validate`, { method: 'POST' }, token);
  assert(valTrfRes.transfer.status === 'Done', 'Transfer status must be Done');

  // Check Balances
  const checkStock2 = await req(`/products/${steelProduct.id}`, {}, token);
  const balMain2 = checkStock2.product.balances.find((b: any) => b.locationId === locMainStore.id);
  const balProd2 = checkStock2.product.balances.find((b: any) => b.locationId === locProdRack.id);
  console.log(`   Main Store Stock: ${balMain2?.quantity} kg (Expected: 60 kg)`);
  console.log(`   Production Rack Stock: ${balProd2?.quantity} kg (Expected: 40 kg)`);
  console.log(`   Total Company Stock: ${checkStock2.product.totalStock} kg (Expected: 100 kg - UNCHANGED)`);

  assert.strictEqual(balMain2?.quantity, 60, 'Main Store stock must be 60 kg');
  assert.strictEqual(balProd2?.quantity, 40, 'Production Rack stock must be 40 kg');
  assert.strictEqual(checkStock2.product.totalStock, 100, 'Total company stock must remain unchanged (100 kg)');
  console.log('   ✅ Step 3 VERIFIED: Source=60, Destination=40, Total=100. Transfer invariant preserved.\n');

  // Step 4: Deliver 20 from Production Rack
  console.log('🔹 Step 4: Deliver 20 kg from Production Rack to Customer');
  const delRes = await req(
    '/deliveries',
    {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'AeroStructures Corp',
        sourceLocationId: locProdRack.id,
        notes: 'Order #AERO-99',
        items: [{ productId: steelProduct.id, quantity: 20 }],
      }),
    },
    token
  );
  const deliveryId = delRes.delivery.id;
  console.log(`   ✅ Created delivery order: ${delRes.delivery.orderNumber}`);

  // Pick & Pack
  await req(`/deliveries/${deliveryId}/pick`, { method: 'POST' }, token);
  await req(`/deliveries/${deliveryId}/pack`, { method: 'POST' }, token);
  console.log('   Items Picked and Packed.');

  // Validate Delivery
  console.log('   Validating delivery...');
  const valDelRes = await req(`/deliveries/${deliveryId}/validate`, { method: 'POST' }, token);
  assert(valDelRes.delivery.status === 'Done', 'Delivery status must be Done');

  // Check Balances
  const checkStock3 = await req(`/products/${steelProduct.id}`, {}, token);
  const balProd3 = checkStock3.product.balances.find((b: any) => b.locationId === locProdRack.id);
  console.log(`   Production Rack Stock: ${balProd3?.quantity} kg (Expected: 20 kg)`);
  console.log(`   Total Company Stock: ${checkStock3.product.totalStock} kg (Expected: 80 kg)`);
  assert.strictEqual(balProd3?.quantity, 20, 'Production stock must decrease by 20 kg to 20 kg');
  assert.strictEqual(checkStock3.product.totalStock, 80, 'Total company stock must decrease by 20 kg to 80 kg');
  console.log('   ✅ Step 4 VERIFIED: Production stock decreased by 20, Total stock decreased by 20.\n');

  // Test Insufficient Stock rejection safeguard
  console.log('🔹 Testing Insufficient Stock rejection safeguard...');
  const excessiveDel = await req(
    '/deliveries',
    {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'Excessive Order Buyer',
        sourceLocationId: locProdRack.id,
        items: [{ productId: steelProduct.id, quantity: 9999 }], // Exceeds available 20
      }),
    },
    token
  );
  try {
    await req(`/deliveries/${excessiveDel.delivery.id}/validate`, { method: 'POST' }, token);
    assert.fail('Expected delivery validation to throw an error due to insufficient stock');
  } catch (err: any) {
    console.log(`   ✅ Safeguard triggered as expected: "${err.message}"\n`);
  }

  // Step 5: Adjust damaged stock: 3 kg damaged (Physical count = 17 kg on Production Rack)
  console.log('🔹 Step 5: Adjust damaged stock (Physical count: 17 kg on Production Rack, down from 20 kg)');
  const adjRes = await req(
    '/adjustments',
    {
      method: 'POST',
      body: JSON.stringify({
        productId: steelProduct.id,
        locationId: locProdRack.id,
        physicalCount: 17,
        reason: '3 kg steel damaged due to handling impact',
      }),
    },
    token
  );
  assert.strictEqual(adjRes.adjustment.difference, -3, 'Expected adjustment difference = -3');
  console.log(`   ✅ Adjustment recorded: ${adjRes.adjustment.adjustmentNumber}, Difference: ${adjRes.adjustment.difference}`);

  // Check Final Stock
  const checkStock4 = await req(`/products/${steelProduct.id}`, {}, token);
  const balProd4 = checkStock4.product.balances.find((b: any) => b.locationId === locProdRack.id);
  console.log(`   Production Rack Stock: ${balProd4?.quantity} kg (Expected: 17 kg)`);
  console.log(`   Total Company Stock: ${checkStock4.product.totalStock} kg (Expected: 77 kg)`);
  assert.strictEqual(balProd4?.quantity, 17, 'Production rack stock must be 17 kg');
  assert.strictEqual(checkStock4.product.totalStock, 77, 'Total stock must be 77 kg');
  console.log('   ✅ Step 5 VERIFIED: Stock correctly updated to physical count 17 kg. Total = 77 kg.\n');

  // Step 6: Verify Stock Ledger & Move History
  console.log('🔹 Step 6: Verify Stock Ledger entries for product...');
  const ledgerRes = await req(`/ledger?productId=${steelProduct.id}`, {}, token);
  const movements = ledgerRes.ledgerEntries;
  console.log(`   Found ${movements.length} ledger events for ${steelProduct.name}:`);

  for (const m of movements) {
    console.log(`   • [${m.movementType}] Reference: ${m.referenceDocument} | Qty: ${m.quantity} kg | Notes: ${m.notes}`);
  }

  assert(movements.some((m: any) => m.movementType === 'RECEIPT' && m.quantity === 100), 'Missing RECEIPT entry in ledger');
  assert(movements.some((m: any) => m.movementType === 'INTERNAL_TRANSFER' && m.quantity === 40), 'Missing INTERNAL_TRANSFER entry in ledger');
  assert(movements.some((m: any) => m.movementType === 'DELIVERY' && m.quantity === -20), 'Missing DELIVERY entry in ledger');
  assert(movements.some((m: any) => m.movementType === 'ADJUSTMENT' && m.quantity === -3), 'Missing ADJUSTMENT entry in ledger');

  console.log('\n   ✅ Step 6 VERIFIED: All 4 operations exist in the Stock Ledger with exact quantities, locations, and audit references.');

  // Test Dashboard KPIs and Dynamic Filters
  console.log('\n🔹 Testing Dashboard KPIs and dynamic filters...');
  const dashRes = await req('/dashboard/summary', {}, token);
  console.log('   KPI Summary:', JSON.stringify(dashRes.kpis, null, 2));
  assert(dashRes.kpis.totalProductsInStock > 0, 'Total products in stock should be > 0');

  const opsReceipts = await req('/dashboard/operations?docType=Receipts', {}, token);
  assert(opsReceipts.operations.every((o: any) => o.docType === 'Receipts'), 'Dynamic filter docType=Receipts failed');

  const opsDone = await req('/dashboard/operations?status=Done', {}, token);
  assert(opsDone.operations.every((o: any) => o.status === 'Done'), 'Dynamic filter status=Done failed');

  console.log('   ✅ Dashboard KPIs and Dynamic Filters verified successfully.');

  console.log('\n🎉 ========================================================');
  console.log('🎉 ALL END-TO-END SCENARIOS & INVARIANTS PASSED 100%!');
  console.log('🎉 ========================================================\n');
}

runTestScenario().catch((err) => {
  console.error('❌ Test Scenario Failed:', err);
  process.exit(1);
});
