const mongoose = require('mongoose');
const Order = require('../models/order.model');
const crypto = require('crypto');
const moment = require('moment');
require('dotenv').config();

// Test tạo payment URL trực tiếp
const testPaymentDirect = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Tìm đơn hàng test vừa tạo
    const order = await Order.findOne().sort({ createdAt: -1 });
    if (!order) {
      console.log('❌ Không tìm thấy đơn hàng nào');
      return;
    }

    console.log('📋 Đơn hàng test:', order.orderNumber);
    console.log('💰 Tổng tiền:', order.totalAmount);

    // Cấu hình VNPAY
    const vnpayConfig = {
      vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'LWXCNYOK',
      vnp_HashSecret: process.env.VNPAY_HASH_SECRET || 'QPGTQ7HWPCBXCCI5WKIBPJWXZK40LTVK',
      vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:5173/payment/vnpay-return',
    };

    // Tạo các tham số VNPAY
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const orderId_vnpay = moment(date).format('YYMMDDHHmmss') + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId_vnpay,
      vnp_OrderInfo: `Thanh toan don hang ${order.orderNumber}`,
      vnp_OrderType: 'other',
      vnp_Amount: order.totalAmount * 100, // VNPAY yêu cầu số tiền * 100
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    console.log('📋 VNPAY Params:', {
      TmnCode: vnp_Params.vnp_TmnCode,
      Amount: vnp_Params.vnp_Amount,
      TxnRef: vnp_Params.vnp_TxnRef,
      OrderInfo: vnp_Params.vnp_OrderInfo
    });

    // Sắp xếp tham số theo thứ tự alphabet
    const sortedParams = {};
    Object.keys(vnp_Params).sort().forEach(key => {
      sortedParams[key] = vnp_Params[key];
    });

    // Tạo sign data
    let signData = '';
    Object.keys(sortedParams).forEach((key, index) => {
      if (index === 0) {
        signData += `${key}=${sortedParams[key]}`;
      } else {
        signData += `&${key}=${sortedParams[key]}`;
      }
    });

    console.log('📝 Sign Data:', signData);
    
    // Tạo secure hash HMAC-SHA512
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(signData).digest('hex');
    
    console.log('✅ Secure Hash:', signed);
    
    sortedParams.vnp_SecureHash = signed;

    // Tạo URL thanh toán
    let paymentUrlParams = '';
    Object.keys(sortedParams).forEach((key, index) => {
      const value = encodeURIComponent(sortedParams[key]);
      if (index === 0) {
        paymentUrlParams += `${key}=${value}`;
      } else {
        paymentUrlParams += `&${key}=${value}`;
      }
    });
    const paymentUrl = vnpayConfig.vnp_Url + '?' + paymentUrlParams;
    
    console.log('\n🔗 Payment URL:');
    console.log(paymentUrl);
    console.log('\n✅ Test completed! Copy URL trên vào browser để test');

    // Cập nhật đơn hàng với transaction ID
    order.vnpayTransactionId = orderId_vnpay;
    order.paymentStatus = 'pending';
    await order.save();
    console.log('💾 Đã cập nhật đơn hàng với transaction ID:', orderId_vnpay);

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Lỗi:', error);
    await mongoose.disconnect();
  }
};

testPaymentDirect();