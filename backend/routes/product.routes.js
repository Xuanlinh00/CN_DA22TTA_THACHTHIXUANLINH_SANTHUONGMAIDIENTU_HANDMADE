const express = require('express');
const router = express.Router();
const {
    createProduct,
    getProducts,
    getProductById,
} = require('../controllers/product.controller.js'); // Import cả 3 hàm
const { protect, vendor } = require('../middleware/auth.middleware.js');

// === ROUTE CHO VENDOR (Bắt buộc đăng nhập + là Vendor) ===
// @route   POST /api/products
// Tạo sản phẩm mới (Tuần 2) [cite: 60-62]
router.post('/', protect, vendor, createProduct);

// === ROUTES CHO KHÁCH HÀNG (Công khai, không cần đăng nhập) ===
// @route   GET /api/products
// Lấy tất cả sản phẩm (Tuần 2) 
router.get('/', getProducts);

// @route   GET /api/products/:id
// Lấy 1 sản phẩm bằng ID (Tuần 2) 
router.get('/:id', getProductById);

module.exports = router;