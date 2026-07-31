const mongoose = require('mongoose');

const transactionItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  unitPrice: Number,
  quantity: Number,
  subtotal: Number
});

const transactionSchema = new mongoose.Schema({
  transactionNo: { 
    type: String, 
    required: true, 
    unique: true 
  }, // e.g. "TXN-20260731-001"
  items: [transactionItemSchema],
  subtotal: { type: Number, required: true },
  
  // Supervisor Discount Authorization details
  discountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  supervisorAuthorized: { type: Boolean, default: false },
  
  totalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Card', 'E-wallet'], 
    required: true 
  },
  cashierId: { type: String, required: true, default: 'CASHIER-1' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);