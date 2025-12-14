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
};
