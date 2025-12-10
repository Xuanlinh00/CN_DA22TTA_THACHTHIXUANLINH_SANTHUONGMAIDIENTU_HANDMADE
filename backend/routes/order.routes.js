const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/order.controller');

router.post('/', protect, authorize('customer'), createOrder);
router.get('/myorders', protect, authorize('customer'), getMyOrders);
router.get('/', protect, authorize('admin'), getAllOrders);
router.patch('/:id/status', protect, authorize('admin', 'vendor'), updateOrderStatus);

module.exports = router;