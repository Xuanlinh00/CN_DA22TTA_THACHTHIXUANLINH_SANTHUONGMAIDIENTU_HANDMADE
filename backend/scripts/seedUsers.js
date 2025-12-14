const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/user.model');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedUsers = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Kiểm tra xem đã có user chưa
    const count = await User.countDocuments();
    if (count > 0) {
      console.log(`⚠️  Đã có ${count} user trong database. Bỏ qua khởi tạo.`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Tạo test users
    const testUsers = [
      {
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@craftify.com',
        password: 'admin123456',
        role: 'admin'
      },
      {
        name: 'Shop Owner Test',
        email: 'shop@craftify.com',
        password: 'shop123456',
        role: 'shop_owner'
      },
      {
        name: 'Regular User',
        email: 'user@craftify.com',
        password: 'user123456',
        role: 'user'
      }
    ];

    // Thêm user vào database
    const createdUsers = await User.insertMany(testUsers);
    console.log(`✅ Đã khởi tạo ${createdUsers.length} user thành công`);

    // Hiển thị user
    console.log('\n👥 User đã tạo:');
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n📝 Thông tin đăng nhập test:');
    testUsers.forEach((user) => {
      console.log(`Email: ${user.email} | Password: ${user.password}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedUsers();
