const mongoose = require('mongoose');

// Schema phụ cho Review (đơn giản hóa theo yêu cầu)
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  // Liên kết Shop (Multi-vendor)
  shop: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shop', 
    required: true 
  },
  user: { // Người tạo (Shop Owner)
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Thông tin cơ bản sản phẩm handmade
  name: { type: String, required: true, trim: true },
  images: [{ type: String }], // Nhiều ảnh cho sản phẩm handmade
  description: { type: String, required: true },
  material: { type: String }, // Chất liệu đặc trung cho handmade
  
  // Danh mục handmade
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  
  // Giá và tồn kho
  price: { type: Number, required: true, min: 0 },
  stockQuantity: { type: Number, required: true, default: 0 },
  sold: { type: Number, default: 0 },

  // Đánh giá cơ bản
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },

  // Thống kê tìm kiếm và bán hàng
  searchCount: { type: Number, default: 0 }, // Số lần được tìm kiếm
  soldThisMonth: { type: Number, default: 0 }, // Số lượng bán trong tháng

  // Trạng thái sản phẩm
  isActive: { type: Boolean, default: true },
  tags: [String], // ["handmade", "unique", "gift"]

  // Thông tin bổ sung cho handmade
  dimensions: { type: String }, // Kích thước
  weight: { type: Number }, // Trọng lượng (gram)
  customizable: { type: Boolean, default: false }, // Có thể tùy chỉnh không

  // Hỏi đáp sản phẩm
  questions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    question: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    answers: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      answer: { type: String },
      createdAt: { type: Date, default: Date.now }
    }]
  }]

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);