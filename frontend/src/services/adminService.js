import axios from '../utils/axios';

export const adminService = {
  // Users
  getAllUsers: async () => {
    const response = await axios.get('/admin/users');
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axios.delete(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await axios.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Shops
  getAllShops: async (params) => {
    const response = await axios.get('/admin/shops', { params });
    return response.data;
  },

  getPendingShops: async () => {
    const response = await axios.get('/admin/pending-shops');
    return response.data;
  },

  approveShop: async (id, status) => {
    const response = await axios.put(`/admin/shops/approve/${id}`, { status });
    return response.data;
  },

  deleteShop: async (id) => {
    const response = await axios.delete(`/admin/shops/${id}`);
    return response.data;
  },

  // Statistics
  getRevenueStats: async () => {
    const response = await axios.get('/admin/stats/revenue');
    return response.data;
  },

  getOrderStats: async () => {
    const response = await axios.get('/admin/stats/orders');
    return response.data;
  },

  getCommission: async () => {
    const response = await axios.get('/admin/stats/commission');
    return response.data;
  },
};
