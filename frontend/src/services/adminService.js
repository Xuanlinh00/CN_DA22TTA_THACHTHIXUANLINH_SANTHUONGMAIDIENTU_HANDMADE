import axios from '../utils/axios';

export const adminService = {
  getAllUsers: async () => {
    const response = await axios.get('/admin/users');
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axios.delete(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await axios.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  getAllOrders: async () => {
    const response = await axios.get('/admin/orders');
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await axios.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  getAllProducts: async () => {
    const response = await axios.get('/admin/products');
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await axios.delete(`/admin/products/${id}`);
    return response.data;
  },

  getAllShops: async (params = {}) => {
    const response = await axios.get('/admin/shops', { params });
    return response.data;
  },

  getPendingShops: async () => {
    const response = await axios.get('/admin/shops?status=pending');
    return response.data;
  },

  approveShop: async (id, status) => {
    const response = await axios.put(`/admin/shops/approve/${id}`, { status });
    return response.data;
  },

  rejectShop: async (id, reason) => {
    const response = await axios.put(`/admin/shops/${id}/reject`, { reason });
    return response.data;
  },

  getRevenueStats: async () => {
    const response = await axios.get('/admin/stats/revenue');
    return response.data;
  },

  getOrderStats: async () => {
    const response = await axios.get('/admin/stats/orders');
    return response.data;
  },

  getAllCategories: async () => {
    const response = await axios.get('/admin/categories');
    return response.data;
  },

  createCategory: async (data) => {
    const response = await axios.post('/admin/categories', data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await axios.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await axios.delete(`/admin/categories/${id}`);
    return response.data;
  },

  getMonthlyRevenue: async (year) => {
    const response = await axios.get('/admin/stats/monthly-revenue', { params: { year } });
    return response.data;
  },

  getCommission: async () => {
    const response = await axios.get('/admin/stats/commission');
    return response.data;
  },
};
