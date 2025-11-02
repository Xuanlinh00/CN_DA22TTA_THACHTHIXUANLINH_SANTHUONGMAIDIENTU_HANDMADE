const express = require('express');
const router = express.Router();
const { createShop } = require('../controllers/shop.controller.js');
// CHỈ CẦN IMPORT 'protect'
const { protect } = require('../middleware/auth.middleware.js'); 

// Định nghĩa đường dẫn POST /api/shops
// Để gọi được API này, user chỉ cần:
// 1. Đi qua 'protect' (Đã đăng nhập, có token hợp lệ)
router.post('/', protect, createShop);

module.exports = router;