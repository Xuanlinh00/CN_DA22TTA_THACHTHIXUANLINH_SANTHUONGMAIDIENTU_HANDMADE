const express = require('express');
const router = express.Router();

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

// PUBLIC ROUTES - Không cần login
router.get('/', getCategories);
router.get('/id', getCategoryById);

// ADMIN ROUTES - Chỉ admin
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;