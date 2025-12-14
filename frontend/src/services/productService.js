import axios from '../utils/axios';

export const productService = {
  getAll: async (params) => {
    const response = await axios.get('/products', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/products/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post('/products', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/products/${id}`);
    return response.data;
  },

  getByShop: async (shopId, params) => {
    const response = await axios.get(`/products/shop/${shopId}`, { params });
    return response.data;
  },

  addReview: async (productId, data) => {
    const response = await axios.post(`/products/${productId}/reviews`, data);
    return response.data;
  },
};
