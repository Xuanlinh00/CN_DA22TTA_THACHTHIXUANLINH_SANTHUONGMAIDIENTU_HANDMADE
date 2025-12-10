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
  // Stats
  getRevenueStats,
  getOrderStats,
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

// Stats
router.get('/stats/revenue', getRevenueStats);
router.get('/stats/orders', getOrderStats);

module.exports = router;