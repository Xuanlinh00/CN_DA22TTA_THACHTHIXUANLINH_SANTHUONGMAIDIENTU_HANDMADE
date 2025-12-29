import axios from '../utils/axios';

export const shopService = {
  create: async (data) => {
    const response = await axios.post('/shops', data);
    return response.data;
  },

  getAll: async (params) => {
    const response = await axios.get('/shops', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/shops/${id}`);
    return response.data;
  },

  getMyShop: async () => {
    const response = await axios.get('/shops/profile');
    return response.data;
  },

  update: async (data) => {
    const response = await axios.put('/shops/profile', data);
    return response.data;
  },

  approveShop: async (id, status) => {
    const response = await axios.patch(`/shops/${id}/status`, { status });
    return response.data;
  },

  getMonthlyRevenue: async () => {
    const response = await axios.get('/shops/stats/monthly-revenue');
    return response.data;
  }
};
