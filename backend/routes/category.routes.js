const express = require('express');
const router = express.Router();

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  initDefaultCategories
} = require('../controllers/category.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

// Routes phải được sắp xếp từ cụ thể đến chung
// ADMIN ROUTES - Chỉ admin (phải trước /:id)
router.post('/init-default', protect, authorize('admin'), initDefaultCategories);
router.post('/', protect, authorize('admin'), createCategory);

// PUBLIC ROUTES - Không cần login
router.get('/:id', getCategoryById);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);
router.get('/', getCategories); // Phải sau /:id

module.exports = router;