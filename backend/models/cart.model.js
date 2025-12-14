const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Mỗi user chỉ có 1 giỏ hàng
  },
  items: [cartItemSchema],
  
  // Tổng giá trị giỏ hàng
  totalAmount: {
    type: Number,
    default: 0
  },
  
  // Tổng số lượng sản phẩm
  totalItems: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Tính toán tổng giá trị và số lượng
cartSchema.methods.calculateTotals = function() {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  return this;
};

// Middleware tự động tính toán khi save
cartSchema.pre('save', function() {
  this.calculateTotals();
});

module.exports = mongoose.model('Cart', cartSchema);