const express = require('express');
const router = express.Router();
const {
    createCategory,
    getCategories,
} = require('../controllers/category.controller.js');
const { protect, admin } = require('../middleware/auth.middleware.js');

// @route   POST /api/categories (Chỉ Admin được tạo)
router.post('/', protect, admin, createCategory);

// @route   GET /api/categories (Ai cũng xem được)
router.get('/', getCategories);

module.exports = router;