const mongoose = require('mongoose');

// Schema cho địa chỉ giao hàng
const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  ward: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  note: { type: String }
});

// Schema cho từng sản phẩm trong đơn hàng
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  name: { type: String, required: true }, // Lưu tên sản phẩm tại thời điểm đặt hàng
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true }
});

// Schema cho phương thức vận chuyển
const shippingMethodSchema = new mongoose.Schema({
  name: { type: String, required: true }, // "Giao hàng nhanh", "Giao hàng tiết kiệm"
  provider: { type: String, required: true }, // "GHN", "GHTK", "VNPost"
  fee: { type: Number, required: true },
  estimatedDays: { type: Number, required: true },
  trackingCode: { type: String } // Mã vận đơn từ API giao hàng
});

const orderSchema = new mongoose.Schema({
  // Thông tin khách hàng
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Mã đơn hàng duy nhất
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Danh sách sản phẩm
  items: [orderItemSchema],
  
  // Địa chỉ giao hàng
  shippingAddress: shippingAddressSchema,
  
  // Phương thức vận chuyển (tích hợp API)
  shippingMethod: shippingMethodSchema,
  
  // Thông tin thanh toán
  paymentMethod: {
    type: String,
    enum: ['VNPAY', 'COD'],
    default: 'VNPAY'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  vnpayTransactionId: { type: String }, // ID giao dịch VNPAY
  
  // Tổng tiền
  subtotal: { type: Number, required: true }, // Tổng tiền hàng
  shippingFee: { type: Number, required: true }, // Phí ship
  totalAmount: { type: Number, required: true }, // Tổng cộng
  
  // Huê hồng cho Admin
  commissionRate: { type: Number, default: 0.05 }, // 5% huê hồng
  commissionAmount: { type: Number, default: 0 },
  
  // Trạng thái đơn hàng
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Lịch sử trạng thái
  statusHistory: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
    note: String
  }],
  
  // Thời gian quan trọng
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  
  // Ghi chú
  note: String,
  cancelReason: String
  
}, { timestamps: true });

// Tạo mã đơn hàng tự động
orderSchema.pre('save', function() {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `HD${timestamp}${random}`;
  }
  
  // Tính huê hồng
  this.commissionAmount = this.subtotal * this.commissionRate;
});

// Thêm trạng thái vào lịch sử
orderSchema.methods.addStatusHistory = function(status, updatedBy, note = '') {
  this.statusHistory.push({
    status,
    updatedBy,
    note,
    updatedAt: new Date()
  });
  this.status = status;
  
  // Cập nhật thời gian tương ứng
  switch(status) {
    case 'confirmed':
      this.confirmedAt = new Date();
      break;
    case 'shipping':
      this.shippedAt = new Date();
      break;
    case 'delivered':
      this.deliveredAt = new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      break;
  }
};

module.exports = mongoose.model('Order', orderSchema);