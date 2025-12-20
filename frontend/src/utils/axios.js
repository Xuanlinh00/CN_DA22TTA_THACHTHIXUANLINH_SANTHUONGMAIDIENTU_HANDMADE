import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Only set Content-Type for non-FormData requests
    // For FormData, let axios set it automatically with boundary
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      // Remove Content-Type header for FormData so axios can set it with boundary
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Chỉ clear token, không redirect tự động
      // Để component xử lý redirect nếu cần
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Chỉ redirect nếu không phải là API call từ form submission
      // Để tránh redirect giữa quá trình submit
      const isFormSubmission = error.config?.method === 'post' || error.config?.method === 'put';
      if (!isFormSubmission) {
        // Delay redirect để component có thời gian xử lý
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 500);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
