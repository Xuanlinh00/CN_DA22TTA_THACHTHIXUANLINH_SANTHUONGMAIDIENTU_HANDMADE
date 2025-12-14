const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Order = require('../models/order.model');

async function checkOrders() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/craftify_handmade';
    await mongoose.connect(mongoUri);
    console.log('✅ Kết nối MongoDB thành công');

    const count = await Order.countDocuments();
    console.log(`\n📦 Tổng số đơn hàng: ${count}`);

    if (count > 0) {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      console.log('\n📋 5 đơn hàng gần nhất:');
      orders.forEach((order, index) => {
        console.log(`\n${index + 1}. Đơn hàng: ${order.orderNumber}`);
        console.log(`   - ID: ${order._id}`);
        console.log(`   - User ID: ${order.user}`);
        console.log(`   - Số sản phẩm: ${order.items?.length || 0}`);
        console.log(`   - Tổng tiền: ${order.totalAmount?.toLocaleString('vi-VN')}đ`);
        console.log(`   - Trạng thái: ${order.status}`);
        console.log(`   - Ngày tạo: ${order.createdAt}`);
        
        // Hiển thị items
        if (order.items && order.items.length > 0) {
          console.log(`   - Sản phẩm:`);
          order.items.forEach((item, i) => {
            console.log(`     ${i + 1}. ${item.name} x${item.quantity} = ${item.subtotal?.toLocaleString('vi-VN')}đ`);
          });
        }
      });
    } else {
      console.log('\n⚠️  Chưa có đơn hàng nào trong database');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

checkOrders();
