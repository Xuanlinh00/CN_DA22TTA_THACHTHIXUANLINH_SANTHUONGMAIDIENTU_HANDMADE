const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema cho địa chỉ nhận hàng
const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  ward: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  
  // Vai trò trong hệ thống handmade marketplace
  role: { 
    type: String, 
    enum: ['user', 'shop_owner', 'admin'], 
    default: 'user' 
  },
  
  // Thông tin cá nhân
  avatar: { type: String, default: 'https://via.placeholder.com/150' },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  phone: { type: String },
  dateOfBirth: { type: Date },
  
  // Địa chỉ nhận hàng (có thể có nhiều)
  addresses: [addressSchema],
  
  // Trạng thái tài khoản
  status: { type: String, enum: ['active', 'banned'], default: 'active' },
  emailVerified: { type: Boolean, default: false },

  // Chức năng quên mật khẩu
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Thống kê cho shop owner
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  
}, { timestamps: true });

// Hash password
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Ẩn thông tin nhạy cảm
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

module.exports = mongoose.model('User', userSchema);