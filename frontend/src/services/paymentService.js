import axios from '../utils/axios';

export const paymentService = {
  // Tạo URL thanh toán VNPAY
  createVNPayPayment: async (orderId, bankCode = '') => {
    const response = await axios.post('/payment/vnpay/create', {
      orderId,
      bankCode
    });
    return response.data;
  }
};
