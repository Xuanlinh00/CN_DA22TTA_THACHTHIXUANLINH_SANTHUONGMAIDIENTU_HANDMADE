const Category = require('../models/category.model');

// Hàm hỗ trợ tạo slug đơn giản
const simpleSlugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/\s+/g, '-')            // khoảng trắng → gạch ngang
    .replace(/[^\w\-]+/g, '')        // bỏ ký tự đặc biệt
    .replace(/\-\-+/g, '-');         // bỏ gạch ngang lặp
};

// ==================== CREATE ====================
const createCategory = async (req, res) => {
  try {
    let { name, slug } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Tên danh mục không được để trống' });
    }

    name = name.trim();
    slug = slug ? simpleSlugify(slug) : simpleSlugify(name);

    if (!slug) {
      return res.status(400).json({ success: false, message: 'Slug không hợp lệ' });
    }

    const existing = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Tên hoặc slug đã tồn tại' });
    }

    const category = await Category.create({ name, slug });
    res.status(201).json({ success: true, message: 'Tạo danh mục thành công', data: category });
  } catch (err) {
    console.error('Lỗi tạo danh mục:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo danh mục' });
  }
};

// ==================== READ ALL ====================
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    console.error('Lỗi lấy danh mục:', err.message);
    res.status(500).json({ success: false, message: 'Không thể lấy danh mục' });
  }
};

// ==================== READ ONE ====================
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh mục' });
  }
};

// ==================== UPDATE ====================
const updateCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    let updateData = {};

    if (name) updateData.name = name.trim();
    if (slug) updateData.slug = simpleSlugify(slug);

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });

    res.json({ success: true, message: 'Cập nhật thành công', data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật danh mục' });
  }
};

// ==================== DELETE ====================
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    res.json({ success: true, message: 'Đã xóa danh mục' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa danh mục' });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
