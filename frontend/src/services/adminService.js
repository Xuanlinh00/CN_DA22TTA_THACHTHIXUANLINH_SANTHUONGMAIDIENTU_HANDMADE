import axios from '../utils/axios';

// ========== ADMIN SERVICE ==========
// Các API call cho trang quản trị admin
// Bao gồm: quản lý user, shop, đơn hàng, thống kê

export const adminService = {
  // ========== QUẢN LÝ NGƯỜI DÙNG ==========
  /**
   * Lấy danh sách tất cả người dùng
   */
  getAllUsers: async () => {
    const response = await axios.get('/admin/users');
    return response.data;
  },

  /**
   * Xóa một người dùng
   * @param {string} id - ID người dùng
   */
  deleteUser: async (id) => {
    const response = await axios.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Cập nhật vai trò người dùng
   * @param {string} id - ID người dùng
   * @param {string} role - Vai trò mới (user, shop_owner, admin)
   */
  updateUserRole: async (id, role) => {
    const response = await axios.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // ========== QUẢN LÝ ĐƠN HÀNG ==========
  /**
   * Lấy danh sách tất cả đơn hàng
   */
  getAllOrders: async () => {
    const response = await axios.get('/admin/orders');
    return response.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng
   * @param {string} id - ID đơn hàng
   * @param {string} status - Trạng thái mới
   */
  updateOrderStatus: async (id, status) => {
    const response = await axios.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  // ========== QUẢN LÝ SẢN PHẨM ==========
  /**
   * Lấy danh sách tất cả sản phẩm
   */
  getAllProducts: async () => {
    const response = await axios.get('/admin/products');
    return response.data;
  },

  /**
   * Xóa một sản phẩm
   * @param {string} id - ID sản phẩm
   */
  deleteProduct: async (id) => {
    const response = await axios.delete(`/admin/products/${id}`);
    return response.data;
  },

  // ========== QUẢN LÝ CỬA HÀNG ==========
  /**
   * Lấy danh sách cửa hàng với bộ lọc
   * @param {Object} params - Tham số lọc (status, page, limit)
   */
  getAllShops: async (params = {}) => {
    const response = await axios.get('/admin/shops', { params });
    return response.data;
  },

  /**
   * Lấy danh sách cửa hàng đang chờ duyệt
   */
  getPendingShops: async () => {
    const response = await axios.get('/admin/shops?status=pending');
    return response.data;
  },

  /**
   * Duyệt hoặc từ chối cửa hàng
   * @param {string} id - ID cửa hàng
   * @param {string} status - Trạng thái (active, rejected)
   */
  approveShop: async (id, status) => {
    const response = await axios.put(`/admin/shops/approve/${id}`, { status });
    return response.data;
  },

  /**
   * Từ chối cửa hàng
   * @param {string} id - ID cửa hàng
   * @param {string} reason - Lý do từ chối
   */
  rejectShop: async (id, reason) => {
    const response = await axios.put(`/admin/shops/${id}/reject`, { reason });
    return response.data;
  },

  // ========== THỐNG KÊ DOANH THU ==========
  /**
   * Lấy thống kê doanh thu tổng quát
   */
  getRevenueStats: async () => {
    const response = await axios.get('/admin/stats/revenue');
    return response.data;
  },

  /**
   * Lấy thống kê trạng thái đơn hàng
   */
  getOrderStats: async () => {
    const response = await axios.get('/admin/stats/orders');
    return response.data;
  },

  // ========== QUẢN LÝ DANH MỤC ==========
  /**
   * Lấy danh sách tất cả danh mục
   */
  getAllCategories: async () => {
    const response = await axios.get('/admin/categories');
    return response.data;
  },

  /**
   * Tạo danh mục mới
   * @param {Object} data - Dữ liệu danh mục
   */
  createCategory: async (data) => {
    const response = await axios.post('/admin/categories', data);
    return response.data;
  },

  /**
   * Cập nhật danh mục
   * @param {string} id - ID danh mục
   * @param {Object} data - Dữ liệu cập nhật
   */
  updateCategory: async (id, data) => {
    const response = await axios.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  /**
   * Xóa danh mục
   * @param {string} id - ID danh mục
   */
  deleteCategory: async (id) => {
    const response = await axios.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // ========== THỐNG KÊ THEO THỜI GIAN ==========
  /**
   * Lấy doanh thu theo tháng
   * @param {number} year - Năm
   */
  getMonthlyRevenue: async (year) => {
    const response = await axios.get('/admin/stats/monthly-revenue', { params: { year } });
    return response.data;
  },

  /**
   * Lấy doanh thu theo ngày
   * @param {number} year - Năm
   * @param {number} month - Tháng
   */
  getDailyRevenue: async (year, month) => {
    const response = await axios.get('/admin/stats/daily-revenue', { params: { year, month } });
    return response.data;
  },

  // ========== THỐNG KÊ HỎA HỒNG ==========
  /**
   * Lấy thông tin hoa hồng
   */
  getCommission: async () => {
    const response = await axios.get('/admin/stats/commission');
    return response.data;
  },

  /**
   * Lấy sản phẩm bán chạy nhất
   */
  getTopSellingProducts: async () => {
    const response = await axios.get('/admin/stats/top-selling-products');
    return response.data;
  },

  /**
   * Lấy doanh thu theo năm
   */
  getYearlyRevenue: async () => {
    const response = await axios.get('/admin/stats/yearly-revenue');
    return response.data;
  },
};
