const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cart.controller');

// Áp dụng middleware bảo vệ cho tất cả route
router.use(protect);

// Lấy giỏ hàng
router.get('/', getCart);

// Thêm sản phẩm vào giỏ
router.post('/', addToCart);

// Cập nhật số lượng sản phẩm
router.put('/:productId', updateCartItem);

// Xóa sản phẩm khỏi giỏ
router.delete('/:productId', removeFromCart);

module.exports = router;