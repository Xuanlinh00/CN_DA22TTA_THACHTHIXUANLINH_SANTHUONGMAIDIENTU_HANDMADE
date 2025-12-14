const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('\n🔍 KIỂM TRA CẤU HÌNH VNPAY\n');
console.log('VNPAY_TMN_CODE:', process.env.VNPAY_TMN_CODE);
console.log('VNPAY_HASH_SECRET:', process.env.VNPAY_HASH_SECRET);
console.log('VNPAY_URL:', process.env.VNPAY_URL);
console.log('VNPAY_RETURN_URL:', process.env.VNPAY_RETURN_URL);

console.log('\n✅ Kiểm tra:');
if (process.env.VNPAY_TMN_CODE === 'DEMOV210') {
  console.log('✅ TMN_CODE đúng (DEMOV210)');
} else {
  console.log('❌ TMN_CODE sai:', process.env.VNPAY_TMN_CODE);
}

if (process.env.VNPAY_HASH_SECRET === 'RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ') {
  console.log('✅ HASH_SECRET đúng');
} else {
  console.log('❌ HASH_SECRET sai');
}

process.exit(0);
