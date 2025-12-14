const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/user.model');

dotenv.config({ path: path.join(__dirname, '../.env') });

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công\n');

    const users = await User.find({}).select('name email role');
    console.log('👥 Users in database:');
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name} (${u.email}) - Role: ${u.role}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

listUsers();
