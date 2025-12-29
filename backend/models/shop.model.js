const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true // Mỗi user chỉ 1 shop 
  },
  shopName: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    ward: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true }
  },
  phone: { type: String, required: true },
  avatar: { type: String, default: 'https://via.placeholder.com/150' },
  coverImage: { type: String, default: 'https://via.placeholder.com/800x200' },
  
  // Trạng thái shop
  status: { 
    type: String, 
    enum: ['pending', 'active', 'rejected'], 
    default: 'pending' 
  },
  
  // Thông tin duyệt (Admin)
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },

  // Thông tin hoa hồng
  totalCommission: { type: Number, default: 0 }, // Tổng hoa hồng phải trả
  paidCommission: { type: Number, default: 0 }, // Hoa hồng đã trả
  commissionPaidAt: { type: Date }, // Lần trả hoa hồng gần nhất
  commissionStatus: { 
    type: String, 
    enum: ['unpaid', 'partial', 'paid'], 
    default: 'unpaid' 
  }, // Trạng thái thanh toán hoa hồng

}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);