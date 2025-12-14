const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/category.model');

dotenv.config();

const seedCategories = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Kiểm tra xem đã có danh mục chưa
    const count = await Category.countDocuments();
    if (count > 0) {
      console.log(`⚠️  Đã có ${count} danh mục trong database. Bỏ qua khởi tạo.`);
      process.exit(0);
    }

    // Danh mục mặc định cho handmade
    const defaultCategories = [
      {
        name: 'Jewelry',
        description: 'Trang sức handmade - Vòng tay, dây chuyền, khuyên tai...',
        image: 'https://via.placeholder.com/300x200?text=Jewelry',
        sortOrder: 1
      },
      {
        name: 'Accessories',
        description: 'Phụ kiện thời trang - Túi, ví, mũ, khăn...',
        image: 'https://via.placeholder.com/300x200?text=Accessories',
        sortOrder: 2
      },
      {
        name: 'Crochet',
        description: 'Đồ móc len - Áo, mũ, túi, gối...',
        image: 'https://via.placeholder.com/300x200?text=Crochet',
        sortOrder: 3
      },
      {
        name: 'Decor',
        description: 'Đồ trang trí - Tranh, nến, hoa khô, trang trí nhà...',
        image: 'https://via.placeholder.com/300x200?text=Decor',
        sortOrder: 4
      },
      {
        name: 'Miniature',
        description: 'Mô hình thu nhỏ - Nhà búp bê, đồ chơi, trang trí...',
        image: 'https://via.placeholder.com/300x200?text=Miniature',
        sortOrder: 5
      },
      {
        name: 'Gift Box',
        description: 'Hộp quà tặng - Quà tặng handmade, bộ quà...',
        image: 'https://via.placeholder.com/300x200?text=GiftBox',
        sortOrder: 6
      },
      {
        name: 'Art & Craft',
        description: 'Nghệ thuật & Thủ công - Tranh vẽ, điêu khắc, mỹ nghệ...',
        image: 'https://via.placeholder.com/300x200?text=ArtCraft',
        sortOrder: 7
      },
      {
        name: 'Home & Living',
        description: 'Nhà & Cuộc sống - Đồ dùng nhà bếp, phòng ngủ, phòng khách...',
        image: 'https://via.placeholder.com/300x200?text=HomeLiving',
        sortOrder: 8
      }
    ];

    // Thêm danh mục vào database
    const createdCategories = await Category.insertMany(defaultCategories);
    console.log(`✅ Đã khởi tạo ${createdCategories.length} danh mục thành công`);

    // Hiển thị danh mục
    console.log('\n📋 Danh mục đã tạo:');
    createdCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - ${cat.description}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

seedCategories();
