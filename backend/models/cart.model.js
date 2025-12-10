const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }, // Cần thiết để hiển thị tên shop trong giỏ
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  totalPrice: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);