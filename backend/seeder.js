require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Setup the PostgreSQL connection pool and adapter for Prisma 7
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
    // Clear existing products
    await prisma.product.deleteMany();
    console.log('Existing products cleared...');

    // Seed new products
    await prisma.product.createMany({
      data: INITIAL_PRODUCTS,
    });

    console.log('Initial POS products successfully seeded to PostgreSQL!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedData();