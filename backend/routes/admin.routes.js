const express = require('express');
const router = express.Router();
const {
    getPendingShops,
    approveShop,
} = require('../controllers/admin.controller.js'); // Import Admin Controller
const { protect, admin } = require('../middleware/auth.middleware.js'); // Import "người gác cổng"

// === TẤT CẢ CÁC ROUTE CỦA ADMIN ===
// Áp dụng "người gác cổng" cho TẤT CẢ các route bên dưới
// User phải Đăng nhập (protect) VÀ là Admin (admin)
router.use(protect, admin);

// @route   GET /api/admin/pending-shops
// Lấy tất cả shop đang chờ duyệt
router.get('/pending-shops', getPendingShops);

// @route   PUT /api/admin/shops/approve/:id
// Duyệt hoặc từ chối shop (với :id là ID của shop)
router.put('/shops/approve/:id', approveShop);

module.exports = router;