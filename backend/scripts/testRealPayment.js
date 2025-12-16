const axios = require('axios');

// Test tạo payment URL thực tế
const testRealPayment = async () => {
  try {
    console.log('🧪 Testing real payment creation...');
    
    // Giả lập một order ID (bạn cần thay bằng order ID thực tế)
    const testData = {
      orderId: '675f8b123456789012345678', // Thay bằng order ID thực tế
      amount: 50000, // 50,000 VND
      orderInfo: 'Test payment for handmade product',
      bankCode: 'VNPAYQR'
    };

    console.log('📋 Test data:', testData);
    
    // Gọi API tạo payment URL
    const response = await axios.post('http://localhost:8000/api/payment/create-payment-url', testData, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN', // Thay bằng JWT token thực tế
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Response:', response.data);
    
    if (response.data.success) {
      console.log('🔗 Payment URL:', response.data.data.paymentUrl);
      console.log('💡 Copy URL này vào browser để test');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 Cần đăng nhập trước. Hãy:');
      console.log('1. Đăng nhập vào ứng dụng');
      console.log('2. Lấy JWT token từ localStorage');
      console.log('3. Thay thế YOUR_JWT_TOKEN trong script này');
    }
  }
};

testRealPayment();