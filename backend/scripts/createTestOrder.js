const mongoose = require('mongoose');
const Order = require('../models/order.model');
const User = require('../models/user.model');
require('dotenv').config();

// Tạo đơn hàng test
const createTestOrder = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Tìm user admin để test
    const adminUser = await User.findOne({ email: 'admin@craftify.com' });
    if (!adminUser) {
      console.log('❌ Không tìm thấy admin user');
      return;
    }

    // Tạo đơn hàng test với orderNumber
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `HD${timestamp}${random}`;

    const testOrder = new Order({
      orderNumber,
      user: adminUser._id,
      items: [{
        product: new mongoose.Types.ObjectId(), // Fake product ID
        shop: new mongoose.Types.ObjectId(), // Fake shop ID
        name: 'Sản phẩm handmade test',
        image: 'test-image.jpg',
        price: 50000,
        quantity: 1,
        subtotal: 50000
      }],
      shippingAddress: {
        fullName: 'Nguyễn Test',
        phone: '0123456789',
        street: '123 Test Street',
        ward: 'Phường Test',
        district: 'Quận Test',
        city: 'TP Test'
      },
      shippingMethod: {
        name: 'Giao hàng nhanh',
        provider: 'GHN',
        fee: 30000,
        estimatedDays: 2
      },
      subtotal: 50000,
      shippingFee: 30000,
      totalAmount: 80000,
      paymentMethod: 'VNPAY'
    });

    const savedOrder = await testOrder.save();
    console.log('✅ Đã tạo đơn hàng test:', savedOrder.orderNumber);
    console.log('📋 Order ID:', savedOrder._id.toString());
    console.log('💰 Tổng tiền:', savedOrder.totalAmount);

    // Đóng kết nối
    await mongoose.disconnect();
    
    return savedOrder._id.toString();

  } catch (error) {
    console.error('❌ Lỗi tạo đơn hàng test:', error);
    await mongoose.disconnect();
  }
};

createTestOrder();