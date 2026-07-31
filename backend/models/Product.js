const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true 
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: 0 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Seeds', 'Fertilizers', 'Feeds', 'Pesticides', 'Tools', 'Uncategorized'],
    default: 'Uncategorized'
  },
  stock: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  sku: { 
    type: String, 
    unique: true, 
    sparse: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);