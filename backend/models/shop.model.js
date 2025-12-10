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
  address: { type: String, required: true },
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

}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);