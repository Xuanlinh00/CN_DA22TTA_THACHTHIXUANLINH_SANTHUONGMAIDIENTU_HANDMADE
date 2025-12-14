const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/user.model');

dotenv.config({ path: path.join(__dirname, '../.env') });

const resetUserPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công\n');

    // Get email and new password from command line arguments
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log('❌ Usage: node resetUserPassword.js <email> <newPassword>');
      console.log('Example: node resetUserPassword.js admin@craftify.com admin123456');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      await mongoose.connection.close();
      process.exit(1);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log(`✅ Password reset successfully for ${user.name} (${user.email})`);
    console.log(`📝 New password: ${newPassword}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

resetUserPassword();
