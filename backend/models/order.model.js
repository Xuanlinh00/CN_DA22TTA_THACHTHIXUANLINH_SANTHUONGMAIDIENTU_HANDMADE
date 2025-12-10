const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }, // Để biết món này của shop nào
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String },
  }],

  // Địa chỉ giao hàng (Cấu trúc chuẩn cho GHN)
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    districtId: { type: Number, required: true }, // ID Quận/Huyện (GHN cần)
    wardCode: { type: String, required: true },   // Mã Phường/Xã (GHN cần)
  },

  // Thông tin thanh toán
  paymentMethod: { type: String, required: true }, // 'COD' or 'VNPAY'
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },
  
  // Thông tin giá
  itemsPrice: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 }, // Phí ship tính từ GHN
  totalPrice: { type: Number, required: true },

  // Trạng thái đơn hàng
  orderStatus: {
    type: String,
    enum: ['pending_payment', 'processing', 'shipped', 'completed', 'cancelled'],
    default: 'pending_payment'
  },

  // Tích hợp GHN
  shippingCode: { type: String }, // Mã vận đơn (Ví dụ: L8CC2...)
  expectedDeliveryTime: { type: Date }, // Thời gian dự kiến giao
  deliveredAt: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);