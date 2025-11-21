const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Số lượng phải >= 1'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Giá không được âm'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Tổng phụ không được âm'],
    },
  },
  { _id: false }
);

// Tự động tính subtotal cho từng item
cartItemSchema.pre('validate', function (next) {
  if (!this.subtotal) {
    this.subtotal = this.price * this.quantity;
  }
  next();
});

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // mỗi user chỉ có 1 giỏ hàng
    },
    items: {
      type: [cartItemSchema],
      validate: [arr => arr.length >= 0, 'Giỏ hàng không hợp lệ'],
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Tổng tiền không được âm'],
    },
  },
  { timestamps: true }
);

// Tự động tính totalPrice
cartSchema.pre('validate', function (next) {
  const itemsTotal = this.items.reduce((acc, item) => acc + item.subtotal, 0);
  this.totalPrice = itemsTotal;
  next();
});

// Index để truy vấn nhanh theo customer
cartSchema.index({ customer: 1 });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
