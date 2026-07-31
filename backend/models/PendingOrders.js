const mongoose = require('mongoose');

const pendingItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  name: String,
  unitPrice: Number,
  quantity: Number
});

const pendingOrderSchema = new mongoose.Schema({
  orderReference: { 
    type: String, 
    required: true, 
    unique: true 
  }, // e.g. "PEND-4821"
  items: [pendingItemSchema],
  subtotal: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  total: { type: Number, required: true },
  cashierId: { type: String, default: 'CASHIER-1' }
}, { timestamps: true });

module.exports = mongoose.model('PendingOrder', pendingOrderSchema);