require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Setup PostgreSQL connection pool and adapter
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const INITIAL_USERS = [
  {
    id: 1,
    username: 'cashier1',
    password: 'password123', // Replace with hashed password if using bcrypt later
    role: 'CASHIER',
  },
  {
    id: 2,
    username: 'admin',
    password: 'adminpassword',
    role: 'ADMIN',
  },
];

const INITIAL_PRODUCTS = [
  { name: "Lettuce Seed", price: 349.00, category: "Seeds", stock: 50, sku: "SEED-001" },
  { name: "Triple 14", price: 1000.00, category: "Fertilizers", stock: 20, sku: "FERT-001" },
  { name: "BiMeg", price: 300.00, category: "Feeds", stock: 15, sku: "FEED-001" },
  { name: "Eggplant Seed", price: 250.00, category: "Seeds", stock: 40, sku: "SEED-002" },
  { name: "Omega 1", price: 550.00, category: "Feeds", stock: 30, sku: "FEED-002" },
  { name: "Compose", price: 1200.00, category: "Fertilizers", stock: 10, sku: "FERT-002" },
  { name: "Worm Killer", price: 120.00, category: "Pesticides", stock: 25, sku: "PEST-001" },
  { name: "Tomato Seed", price: 380.00, category: "Seeds", stock: 35, sku: "SEED-003" },
  { name: "Shovel", price: 400.00, category: "Tools", stock: 12, sku: "TOOL-001" },
  { name: "Omega 2", price: 650.00, category: "Feeds", stock: 18, sku: "FEED-003" },
  { name: "Rat killer", price: 100.00, category: "Pesticides", stock: 50, sku: "PEST-002" },
  { name: "Wheel Barrow", price: 150.00, category: "Tools", stock: 5, sku: "TOOL-002" },
];

async function seedData() {
  try {
    console.log('Cleaning up old database records...');

    // 1. Delete dependent tables first to avoid FK constraint errors
    await prisma.transactionItem.deleteMany();
    await prisma.reconciliation.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    console.log('Database cleared.');

    // 2. Seed Users
    await prisma.user.createMany({
      data: INITIAL_USERS,
    });
    console.log('Users seeded (Cashier ID: 1 created).');

    // 3. Seed Products
    await prisma.product.createMany({
      data: INITIAL_PRODUCTS,
    });
    console.log('Initial POS products successfully seeded!');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedData();