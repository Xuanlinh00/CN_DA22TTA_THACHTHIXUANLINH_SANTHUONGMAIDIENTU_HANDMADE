const express = require('express');
const router = express.Router();
const { createShop } = require('../controllers/shop.controller.js');
const { protect, vendor } = require('../middleware/auth.middleware.js'); // Import 2 "người gác cổng"

// Định nghĩa đường dẫn POST /api/shops
// Để gọi được API này, user phải:
// 1. Đi qua 'protect' (Đã đăng nhập, có token hợp lệ)
// 2. Đi qua 'vendor' (Có role là 'vendor')
router.post('/', protect, vendor, createShop);

module.exports = router;