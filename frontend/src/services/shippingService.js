import axios from '../utils/axios';

export const shippingService = {
  getProvinces: async () => {
    const response = await axios.get('/shipping/provinces');
    return response.data;
  },

  getDistricts: async (provinceId) => {
    const response = await axios.get(`/shipping/districts/${provinceId}`);
    return response.data;
  },

  getWards: async (districtId) => {
    const response = await axios.get(`/shipping/wards/${districtId}`);
    return response.data;
  },

  calculateFee: async (data) => {
    const response = await axios.post('/shipping/calculate-fee', data);
    return response.data;
  },

  trackOrder: async (orderCode) => {
    const response = await axios.get(`/shipping/track/${orderCode}`);
    return response.data;
  },

  getServices: async (params) => {
    const response = await axios.get('/shipping/services', { params });
    return response.data;
  }
};
