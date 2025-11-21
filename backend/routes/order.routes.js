const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Khách hàng tạo đơn hàng
router.post('/', protect, authorize('customer'), createOrder);

// Khách hàng xem đơn hàng của mình
router.get('/myorders', protect, authorize('customer'), getMyOrders);

// Admin xem tất cả đơn hàng
router.get('/', protect, authorize('admin'), getAllOrders);

// Admin hoặc Vendor cập nhật trạng thái đơn hàng
router.patch('/:id/status', protect, authorize('admin', 'vendor'), updateOrderStatus);

module.exports = router;
