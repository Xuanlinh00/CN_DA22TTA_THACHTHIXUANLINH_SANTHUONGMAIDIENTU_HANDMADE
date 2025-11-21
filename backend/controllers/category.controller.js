const Category = require('../models/category.model');

// @desc    Admin tạo một danh mục mới
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;

    // Kiểm tra trùng tên hoặc slug
    const existing = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return res.status(400).json({ message: 'Tên hoặc slug đã tồn tại' });
    }

    const category = await Category.create({ name, slug });
    res.status(201).json(category);
  } catch (error) {
    console.error('Lỗi tạo danh mục:', error.message);
    res.status(500).json({ message: 'Không thể tạo danh mục' });
  }
};

// @desc    Lấy tất cả danh mục
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // Sắp xếp theo tên
    res.status(200).json(categories);
  } catch (error) {
    console.error('Lỗi lấy danh mục:', error.message);
    res.status(500).json({ message: 'Không thể lấy danh sách danh mục' });
  }
};

module.exports = {
  createCategory,
  getCategories,
};
