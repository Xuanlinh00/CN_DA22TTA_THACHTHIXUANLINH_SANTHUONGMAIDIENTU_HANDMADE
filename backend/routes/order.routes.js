const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getShopOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderById,
  calculateShippingFee
} = require('../controllers/order.controller');

// Routes phải được sắp xếp từ cụ thể đến chung
router.post('/calculate-shipping', protect, calculateShippingFee);
router.post('/', protect, authorize('user', 'shop_owner'), createOrder);
router.get('/my-orders', protect, authorize('user', 'shop_owner'), getMyOrders);
router.get('/shop-orders', protect, authorize('shop_owner'), getShopOrders);
router.get('/:id', protect, getOrderById); // Thêm route lấy chi tiết đơn hàng
router.patch('/:id/status', protect, authorize('admin', 'shop_owner'), updateOrderStatus);
router.patch('/:id/cancel', protect, cancelOrder);
router.get('/', protect, authorize('admin'), getAllOrders);

module.exports = router;