require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Setup PostgreSQL connection pool and adapter
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedData() {
  try {
    console.log('Cleaning up old database records...');
    await prisma.transactionItem.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.reconciliation.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    console.log('Database cleared.');

    // 1. Seed Users
    const cashier = await prisma.user.create({
      data: {
        username: 'cashier1',
        password: 'hashedpassword123',
        role: 'CASHIER',
      },
    });

    const admin = await prisma.user.create({
      data: {
        username: 'admin1',
        password: 'hashedpassword123',
        role: 'ADMIN',
      },
    });

    console.log('Users seeded.');

    // 2. Seed Products (With Expiry Dates)
    const productsData = [
      { name: 'Whole Milk 1L', price: 95.0, category: 'Dairy', stock: 40, sku: 'DRY-001', expiryDate: new Date('2026-08-15') },
      { name: 'Cheddar Cheese Block 250g', price: 180.0, category: 'Dairy', stock: 25, sku: 'DRY-002', expiryDate: new Date('2026-10-30') },
      { name: 'Sliced Bread (Whole Wheat)', price: 75.0, category: 'Bakery', stock: 30, sku: 'BKY-001', expiryDate: new Date('2026-09-05') },
      { name: 'Canned Tuna in Oil 180g', price: 55.0, category: 'Canned Goods', stock: 100, sku: 'CND-001', expiryDate: new Date('2028-06-30') },
      { name: 'Instant Noodles (Chicken)', price: 18.0, category: 'Pantry', stock: 150, sku: 'PNT-001', expiryDate: new Date('2027-03-15') },
      { name: 'Paracetamol 500mg (Box of 100)', price: 350.0, category: 'Pharmacy', stock: 20, sku: 'MED-001', expiryDate: new Date('2027-11-20') },
      { name: 'Multi-Surface Disinfectant Spray', price: 220.0, category: 'Household', stock: 35, sku: 'HSH-001', expiryDate: new Date('2027-05-10') },
      { name: 'White Latex Paint 4L', price: 1150.0, category: 'Paints', stock: 15, sku: 'PT-001', expiryDate: new Date('2027-08-31') },
      { name: 'PVC Pipe Cement Glue 100ml', price: 120.0, category: 'Hardware', stock: 50, sku: 'HW-003', expiryDate: new Date('2026-12-31') },
      { name: 'Silicon Sealant Clear', price: 280.0, category: 'Hardware', stock: 40, sku: 'HW-004', expiryDate: new Date('2027-02-28') },
    ];

    await prisma.product.createMany({ data: productsData });
    const dbProducts = await prisma.product.findMany();
    console.log('Products seeded.');

    // 3. Seed 30 Days of Transactions & Reconciliations
    console.log('Generating 30 days of sales transactions...');
    let transactionCounter = 1000;
    let reportCounter = 100;

    for (let i = 30; i >= 0; i--) {
      const dailyTransactionCount = Math.floor(Math.random() * 4) + 2;
      let dailyGrossSales = 0;
      let dailyTotalDiscounts = 0;
      let dailyNetSales = 0;
      let dailyCashSales = 0;

      for (let tx = 0; tx < dailyTransactionCount; tx++) {
        transactionCounter++;

        const txDate = new Date();
        txDate.setDate(txDate.getDate() - i);
        txDate.setHours(Math.floor(Math.random() * 9) + 8, Math.floor(Math.random() * 60));

        const itemCount = Math.floor(Math.random() * 3) + 1;
        const selectedProducts = [...dbProducts].sort(() => 0.5 - Math.random()).slice(0, itemCount);

        let transactionSubtotal = 0;

        const itemsToCreate = selectedProducts.map((p) => {
          const qty = Math.floor(Math.random() * 3) + 1;
          const unitPrice = Number(p.price);
          const itemSubtotal = unitPrice * qty;

          transactionSubtotal += itemSubtotal;

          return {
            productId: p.id,
            name: p.name,
            unitPrice: unitPrice,
            quantity: qty,
            subtotal: itemSubtotal,
          };
        });

        const hasDiscount = Math.random() < 0.15;
        const discountPercent = hasDiscount ? 10 : 0;
        const discountAmount = (transactionSubtotal * discountPercent) / 100;
        const totalAmount = transactionSubtotal - discountAmount;

        const paymentMethods = ['CASH', 'CARD', 'E_Wallet'];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        dailyGrossSales += transactionSubtotal;
        dailyTotalDiscounts += discountAmount;
        dailyNetSales += totalAmount;
        if (paymentMethod === 'CASH') dailyCashSales += totalAmount;

        const dateCode = `${txDate.getFullYear()}${String(txDate.getMonth() + 1).padStart(2, '0')}${String(txDate.getDate()).padStart(2, '0')}`;
        const transactionNo = `TXN-${dateCode}-${transactionCounter}`;

        await prisma.transaction.create({
          data: {
            transactionNo,
            subtotal: transactionSubtotal,
            discountPercent,
            discountAmount,
            supervisorAuthorized: hasDiscount,
            totalAmount,
            paymentMethod,
            cashierId: cashier.id,
            createdAt: txDate,
            items: {
              create: itemsToCreate,
            },
          },
        });
      }

      // Create Daily Reconciliation (X-Reading)
      reportCounter++;
      const recDate = new Date();
      recDate.setDate(recDate.getDate() - i);
      recDate.setHours(18, 0, 0);

      const p1000 = Math.floor(dailyCashSales / 1000);
      const remainingCash = dailyCashSales % 1000;
      const p500 = Math.floor(remainingCash / 500);
      const p100 = Math.floor((remainingCash % 500) / 100);

      const cashierCash = p1000 * 1000 + p500 * 500 + p100 * 100;
      const shortOver = cashierCash - dailyCashSales;

      let status = 'BALANCED';
      if (shortOver < 0) status = 'SHORTAGE';
      if (shortOver > 0) status = 'OVERAGE';

      await prisma.reconciliation.create({
        data: {
          reportNo: `REP-${recDate.getFullYear()}${String(recDate.getMonth() + 1).padStart(2, '0')}${String(recDate.getDate()).padStart(2, '0')}-${reportCounter}`,
          reconciliationDate: recDate,
          cashierId: cashier.id,
          grossSales: dailyGrossSales,
          pointsAvailed: 0,
          totalDiscount: dailyTotalDiscounts,
          netSales: dailyNetSales,
          cashDiscount: 0,
          p1000,
          p500,
          p100,
          posCash: dailyCashSales,
          cashierCash,
          shortOver,
          status,
          notes: 'Daily automated shift closure reconciliation.',
          createdAt: recDate,
        },
      });
    }

    console.log('Seeding finished successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();