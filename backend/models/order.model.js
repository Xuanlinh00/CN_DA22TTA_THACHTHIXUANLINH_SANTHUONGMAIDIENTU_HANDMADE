const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  quantity: { type: Number, required: true, min: [1, 'Số lượng phải >= 1'] },
  price: { type: Number, required: true, min: [0, 'Giá không được âm'] },
  subtotal: { type: Number, required: true, min: [0, 'Tổng phụ không được âm'] },
});

// Tự động tính subtotal
orderItemSchema.pre('validate', function (next) {
  if (!this.subtotal) {
    this.subtotal = this.price * this.quantity;
  }
  next();
});

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    orderItems: {
      type: [orderItemSchema],
      validate: [arr => arr.length > 0, 'Đơn hàng phải có ít nhất 1 sản phẩm'],
    },

    shippingInfo: {
      provider: { type: String, required: true },
      shippingFee: { type: Number, required: true, default: 0, min: [0, 'Phí ship không được âm'] },
    },

    paymentInfo: {
      method: { type: String, default: 'VNPAY', enum: ['VNPAY', 'COD'] },
      status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
      paidAt: { type: Date },
    },

    totalPrice: { type: Number, required: true, min: [0, 'Tổng tiền không được âm'] },

    commissionInfo: {
      commissionAmount: { type: Number, required: true, default: 0, min: [0, 'Hoa hồng không được âm'] },
      revenueAmount: { type: Number, required: true, default: 0, min: [0, 'Doanh thu không được âm'] },
      status: { type: String, enum: ['pending', 'paid_out'], default: 'pending' },
    },

    orderStatus: {
      type: String,
      enum: ['pending_payment', 'processing', 'shipped', 'completed', 'cancelled'],
      default: 'pending_payment',
    },
  },
  { timestamps: true }
);

// Tự động tính totalPrice
orderSchema.pre('validate', function (next) {
  const itemsTotal = this.orderItems.reduce((acc, item) => acc + item.subtotal, 0);
  this.totalPrice = itemsTotal + (this.shippingInfo?.shippingFee || 0);
  next();
});

// Index để truy vấn nhanh
orderSchema.index({ customer: 1 });
orderSchema.index({ 'orderItems.shop': 1 });

module.exports = mongoose.model('Order', orderSchema);
