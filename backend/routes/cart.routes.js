const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getCart, addToCart, removeFromCart } = require('../controllers/cart.controller');

// Áp dụng middleware bảo vệ
router.use(protect);

// Lấy giỏ hàng
router.get('/', getCart);

// Thêm sản phẩm vào giỏ
router.post('/add', addToCart);

// Xoá sản phẩm khỏi giỏ
router.delete('/remove/:productId', removeFromCart);

module.exports = router;
