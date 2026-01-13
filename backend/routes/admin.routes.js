const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware.js');  // Sửa import: authorize thay vì admin
const {
  // Shop
  getPendingShops,
  approveShop,
  getAllShops,
  deleteShop,
  // User
  getAllUsers,
  deleteUser,
  updateUserRole,
  // Orders
  getAllOrders,
  // Stats
  getRevenueStats,
  getOrderStats,
  getMonthlyRevenue,
  getDailyRevenue,
  getTopSellingProducts,
  calculateCommission,
} = require('../controllers/admin.controller.js');

// Áp dụng middleware cho tất cả route admin: protect + chỉ cho phép role 'admin'
router.use(protect, authorize('admin'));

// Shop management
router.get('/pending-shops', getPendingShops);
router.put('/shops/approve/:id', approveShop);
router.get('/shops', getAllShops);
router.delete('/shops/:id', deleteShop);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

// Orders
router.get('/orders', getAllOrders);

// Stats
router.get('/stats/revenue', getRevenueStats);
router.get('/stats/orders', getOrderStats);
router.get('/stats/monthly-revenue', getMonthlyRevenue);
router.get('/stats/daily-revenue', getDailyRevenue);
router.get('/stats/top-selling-products', getTopSellingProducts);
router.get('/stats/commission', calculateCommission);

module.exports = router;