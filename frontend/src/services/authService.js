import axios from '../utils/axios';

export const authService = {
  register: async (data) => {
    const response = await axios.post('/auth/register', data);
    return response.data;
  },

  login: async (data) => {
    const response = await axios.post('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await axios.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axios.put('/auth/profile', data);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await axios.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await axios.post('/auth/addresses', addressData);
    return response.data.data || response.data;
  },

  updateAddress: async (addressId, addressData) => {
    const response = await axios.put(`/auth/addresses/${addressId}`, addressData);
    return response.data.data || response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await axios.delete(`/auth/addresses/${addressId}`);
    return response.data.data || response.data;
  },
};
