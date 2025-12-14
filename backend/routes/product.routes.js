const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  addReview,
  addQuestion,
  answerQuestion
} = require('../controllers/product.controller');

// Routes phải được sắp xếp từ cụ thể đến chung
router.post('/', protect, authorize('shop_owner'), uploadProductImages, createProduct);
router.get('/shop/:shopId', getProducts); // Lấy sản phẩm theo shop (phải trước /:id)
router.get('/:id', getProductById);
router.put('/:id', protect, authorize('shop_owner'), updateProduct);
router.delete('/:id', protect, authorize('shop_owner'), deleteProduct);
router.post('/:id/reviews', protect, addReview);
router.post('/:id/questions', protect, addQuestion);
router.post('/:id/questions/:questionId/answers', protect, authorize('shop_owner', 'admin'), answerQuestion);
router.get('/', getProducts); // Phải sau /:id

module.exports = router;