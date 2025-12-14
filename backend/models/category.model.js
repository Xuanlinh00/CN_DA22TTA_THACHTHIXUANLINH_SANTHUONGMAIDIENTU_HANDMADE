const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
    default: 'https://via.placeholder.com/300x200' 
  },
  
  // Icon emoji cho danh mục
  icon: {
    type: String,
    default: '📦'
  },
  
  // Danh mục dành riêng cho handmade
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Thứ tự hiển thị
  sortOrder: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// Các danh mục mặc định cho handmade
categorySchema.statics.getDefaultCategories = function() {
  return [
    { name: 'Jewelry', description: 'Trang sức handmade', sortOrder: 1 },
    { name: 'Accessories', description: 'Phụ kiện thời trang', sortOrder: 2 },
    { name: 'Crochet', description: 'Đồ móc len', sortOrder: 3 },
    { name: 'Decor', description: 'Đồ trang trí', sortOrder: 4 },
    { name: 'Miniature', description: 'Mô hình thu nhỏ', sortOrder: 5 },
    { name: 'Gift Box', description: 'Hộp quà tặng', sortOrder: 6 }
  ];
};

module.exports = mongoose.model('Category', categorySchema);