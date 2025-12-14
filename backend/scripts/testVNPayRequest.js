require('dotenv').config();
const crypto = require('crypto');
const qs = require('qs');
const moment = require('moment');

console.log('\n=== TEST TẠO REQUEST VNPAY ===\n');

// Cấu hình
const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE,
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
  vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:5174/payment/vnpay-return',
};

console.log('📋 Cấu hình VNPAY:');
console.log('   TMN_CODE:', vnpayConfig.vnp_TmnCode);
console.log('   HASH_SECRET:', vnpayConfig.vnp_HashSecret ? '✅ Có' : '❌ Không có');
console.log('   URL:', vnpayConfig.vnp_Url);
console.log('   RETURN_URL:', vnpayConfig.vnp_ReturnUrl);
console.log();

// Tạo tham số test
const date = new Date();
const createDate = moment(date).format('YYYYMMDDHHmmss');
const orderId_vnpay = moment(date).format('DDHHmmss');
const amount = 100000; // 100,000 VNĐ
const ipAddr = '127.0.0.1'; // IPv4

const vnp_Params = {
  vnp_Version: '2.1.0',
  vnp_Command: 'pay',
  vnp_TmnCode: vnpayConfig.vnp_TmnCode,
  vnp_Locale: 'vn',
  vnp_CurrCode: 'VND',
  vnp_TxnRef: orderId_vnpay,
  vnp_OrderInfo: 'Test thanh toan',
  vnp_OrderType: 'other',
  vnp_Amount: amount * 100,
  vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
  vnp_IpAddr: ipAddr,
  vnp_CreateDate: createDate,
};

console.log('📦 Tham số gửi lên VNPAY:');
console.log(JSON.stringify(vnp_Params, null, 2));
console.log();

// Sắp xếp tham số
const sortedParams = {};
Object.keys(vnp_Params).sort().forEach(key => {
  sortedParams[key] = vnp_Params[key];
});

// Tạo query string
const signData = qs.stringify(sortedParams, { encode: false });
console.log('🔗 Query string (trước khi hash):');
console.log(signData);
console.log();

// Tạo secure hash
const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

sortedParams.vnp_SecureHash = signed;

console.log('🔐 Secure Hash:', signed);
console.log();

// Tạo URL thanh toán
const paymentUrl = vnpayConfig.vnp_Url + '?' + qs.stringify(sortedParams, { encode: false });

console.log('✅ URL thanh toán VNPAY:');
console.log(paymentUrl);
console.log();

console.log('📝 Kiểm tra:');
console.log('   ✅ TMN_CODE:', vnpayConfig.vnp_TmnCode === 'DEMOV210' ? 'Đúng' : '❌ SAI');
console.log('   ✅ IP Address:', ipAddr === '127.0.0.1' ? 'Đúng (IPv4)' : '❌ SAI');
console.log('   ✅ Amount:', vnp_Params.vnp_Amount, '(đã nhân 100)');
console.log('   ✅ Return URL:', vnpayConfig.vnp_ReturnUrl);
console.log();

console.log('🎯 Bạn có thể copy URL trên và paste vào trình duyệt để test!');
console.log();
