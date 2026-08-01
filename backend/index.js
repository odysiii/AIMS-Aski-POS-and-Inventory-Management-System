require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Models
const ProductModel = require('./models/Product').ProductModel;
const TransactionModel = require('./models/Transaction');
const ReconciliationModel = require('./models/Reconciliation');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await ProductModel.findAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// 2. Search Product by Barcode or 6-digit Code
app.get('/api/products/barcode/:code', async (req, res) => {
  try {
    const products = await ProductModel.findByBarcode(req.params.code);
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(products);
  } catch (error) {
    console.error('Error finding barcode:', error);
    res.status(500).json({ error: 'Barcode lookup failed' });
  }
});

// 3. Create New Transaction (Checkout)
app.post('/api/transactions', async (req, res) => {
  try {
    const result = await TransactionModel.createCheckout(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Transaction failed' });
  }
});

// 4. Get All Transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await TransactionModel.findAll();
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// --- RECONCILIATION ROUTES ---

// Get Expected Cash for Today
// Get Expected Cash for Today
app.get('/api/reconciliation/expected-cash', async (req, res) => {
  try {
    const data = await ReconciliationModel.getExpectedCash();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error calculating expected cash:', error);
    return res.status(500).json({ 
      error: 'Failed to calculate expected cash', 
      expectedCash: 0, 
      grossSales: 0 
    });
  }
});

// Save End of Day Reconciliation
app.post('/api/reconciliation', async (req, res) => {
  try {
    const record = await ReconciliationModel.create(req.body); // Passes req.body object
    res.status(201).json({ message: 'Reconciliation Submitted', record });
  } catch (error) {
    console.error('Error creating reconciliation:', error);
    res.status(500).json({ error: 'Failed to submit reconciliation' });
  }
});

// Get All Historical Reconciliations
app.get('/api/reconciliation', async (req, res) => {
  try {
    const recons = await ReconciliationModel.findAll();
    res.json(recons);
  } catch (error) {
    console.error('Error fetching reconciliations:', error);
    res.status(500).json({ error: 'Failed to fetch all reconciliations' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 POS Server running on http://localhost:${PORT}`);
});