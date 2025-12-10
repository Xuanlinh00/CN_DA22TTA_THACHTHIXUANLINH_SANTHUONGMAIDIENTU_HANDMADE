const mongoose = require('mongoose');

// Schema phụ cho Review
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // Lưu tên lúc review để đỡ populate nhiều
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Schema phụ cho Question & Answer
const answerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Người trả lời (thường là Shop)
  name: String,
  answer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const questionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  question: { type: String, required: true },
  answers: [answerSchema], // Một câu hỏi có thể có nhiều câu trả lời
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  // Liên kết Shop (Multi-vendor)
  shop: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shop', 
    required: true 
  },
  user: { // Người tạo (thường trùng user của Shop)
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  name: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // Có thể đổi thành ObjectId nếu muốn link chặt
  
  price: { type: Number, required: true, default: 0 },
  countInStock: { type: Number, required: true, default: 0 }, // Tồn kho hiện tại
  sold: { type: Number, default: 0 }, // Số lượng đã bán (để tính Best Seller)

  // Đánh giá
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },

  // Hỏi đáp
  questions: [questionSchema],

  // Trạng thái sản phẩm
  isActive: { type: Boolean, default: true }, // Ẩn/Hiện sản phẩm
  tags: [String], // Ví dụ: ["handmade", "gốm", "quà tặng"]

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);