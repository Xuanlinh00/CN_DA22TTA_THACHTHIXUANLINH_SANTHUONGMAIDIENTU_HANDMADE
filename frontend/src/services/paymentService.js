import axios from '../utils/axios';

export const paymentService = {
  createPaymentUrl: async (data) => {
    const response = await axios.post('/payment/vnpay/create-payment', data);
    return response.data;
  },

  vnpayReturn: async (params) => {
    const response = await axios.get('/payment/vnpay/return', { params });
    return response.data;
  },

  getBankList: async () => {
    const response = await axios.get('/payment/banks');
    return response.data;
  }
};
