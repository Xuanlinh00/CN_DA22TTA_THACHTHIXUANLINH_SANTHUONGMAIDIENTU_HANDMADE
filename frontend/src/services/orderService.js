import axios from '../utils/axios';

export const orderService = {
  create: async (data) => {
    const response = await axios.post('/orders', data);
    return response.data;
  },

  getMyOrders: async (params) => {
    const response = await axios.get('/orders/my-orders', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axios.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  cancel: async (id) => {
    const response = await axios.patch(`/orders/${id}/cancel`);
    return response.data;
  },

  confirmDelivery: async (id) => {
    const response = await axios.patch(`/orders/${id}/confirm-delivery`);
    return response.data;
  },

  getShopOrders: async (params) => {
    const response = await axios.get('/orders/shop-orders', { params });
    return response.data;
  },

  getAllOrders: async (params) => {
    const response = await axios.get('/orders', { params });
    return response.data;
  },
};
