const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller'); 
const { protect, authorize } = require('../middleware/auth.middleware');

// === ROUTES CHO VENDOR (Bắt buộc đăng nhập + là Vendor) ===
// @route   POST /api/products
// @desc    Tạo sản phẩm mới
// @access  Private (Vendor)
router.post('/', protect, authorize('vendor'), createProduct);

// @route   PUT /api/products/:id
// @desc    Vendor cập nhật sản phẩm của mình
// @access  Private (Vendor)
router.put('/:id', protect, authorize('vendor'), updateProduct);

// @route   DELETE /api/products/:id
// @desc    Vendor xóa sản phẩm của mình
// @access  Private (Vendor)
router.delete('/:id', protect, authorize('vendor'), deleteProduct);

// === ROUTES CHO KHÁCH HÀNG (Công khai, không cần đăng nhập) ===
// @route   GET /api/products
// @desc    Lấy tất cả sản phẩm
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/:id
// @desc    Lấy chi tiết 1 sản phẩm bằng ID
// @access  Public
router.get('/:id', getProductById);


// @route   GET /api/products/admin/all
// @desc    Admin lấy tất cả sản phẩm (bao gồm cả sản phẩm bị ẩn)
// @access  Private (Admin)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const products = await require('../models/product.model').find().populate('user', 'name email');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách sản phẩm' });
  }
});

module.exports = router;
