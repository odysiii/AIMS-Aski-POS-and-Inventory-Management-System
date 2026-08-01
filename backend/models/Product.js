// models/Product.js
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ProductModel = {
  // Fetch all products ordered by ID
  findAll: async () => {
    return await prisma.product.findMany({
      orderBy: { id: 'asc' },
    });
  },

  // Find product by ID
  findById: async (id) => {
    return await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
  },

  // Find product by exact barcode OR matching last 6 digits
  findByBarcode: async (code) => {
    return await prisma.product.findMany({
      where: {
        OR: [
          { barcode: code },
          { barcode: { endsWith: code } },
        ],
      },
    });
  },

  // Create a new product
  create: async (data) => {
    return await prisma.product.create({
      data: {
        barcode: data.barcode,
        name: data.name,
        price: parseFloat(data.price),
        category: data.category || 'Uncategorized',
        stock: parseInt(data.stock) || 0,
      },
    });
  },
};

module.exports = { ProductModel, prisma }; // Exporting prisma instance for transactions