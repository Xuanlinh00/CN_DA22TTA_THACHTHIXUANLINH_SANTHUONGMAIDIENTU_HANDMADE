const express = require('express');
const router = express.Router();

// Import Controller
const { 
  createShop, 
  getAllShops, 
  getMyShop, 
  getShopById, 
  updateShop, 
  adminApproveShop 
} = require('../controllers/shop.controller');

// Import Middleware - chỉ cần 2 cái này
const { protect, authorize } = require('../middleware/auth.middleware');

// --- CÁC ROUTE ---

// 1. Đăng ký shop mới (chỉ user đã login)
router.post('/', protect, createShop);

// 2. Lấy danh sách tất cả shop (Public)
router.get('/', getAllShops);

// 3. Vendor hoặc admin quản lý shop của mình
router.get('/profile', protect, authorize('vendor', 'admin'), getMyShop);
router.put('/profile', protect, authorize('vendor', 'admin'), updateShop);

// 4. Admin duyệt shop - CHỈ ADMIN
router.patch('/:id/status', protect, authorize('admin'), adminApproveShop);

// 5. Xem chi tiết shop bất kỳ (Public)
router.get('/:id', getShopById);

module.exports = router;