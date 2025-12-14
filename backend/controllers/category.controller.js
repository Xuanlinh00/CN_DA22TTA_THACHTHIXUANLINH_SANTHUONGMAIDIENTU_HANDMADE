const Category = require('../models/category.model');

// Lấy tất cả danh mục
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết danh mục
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Danh mục không tồn tại' 
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo danh mục mới (Admin only)
const createCategory = async (req, res) => {
  try {
    const { name, description, image, icon, sortOrder } = req.body;
    
    // Kiểm tra trùng tên
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục đã tồn tại'
      });
    }
    
    const category = new Category({
      name,
      description,
      image,
      icon: icon || '📦',
      sortOrder: sortOrder || 0
    });
    
    const savedCategory = await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Đã tạo danh mục thành công',
      data: savedCategory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật danh mục (Admin only)
const updateCategory = async (req, res) => {
  try {
    const { name, description, image, icon, sortOrder, isActive } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Danh mục không tồn tại'
      });
    }
    
    // Kiểm tra trùng tên (nếu đổi tên)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Tên danh mục đã tồn tại'
        });
      }
    }
    
    category.name = name || category.name;
    category.description = description || category.description;
    category.image = image || category.image;
    category.icon = icon || category.icon;
    category.sortOrder = sortOrder !== undefined ? sortOrder : category.sortOrder;
    category.isActive = isActive !== undefined ? isActive : category.isActive;
    
    const updatedCategory = await category.save();
    
    res.json({
      success: true,
      message: 'Đã cập nhật danh mục thành công',
      data: updatedCategory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa danh mục (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Danh mục không tồn tại'
      });
    }
    
    // Kiểm tra xem có sản phẩm nào đang sử dụng danh mục này không
    const Product = require('../models/product.model');
    const productCount = await Product.countDocuments({ category: req.params.id });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục này vì có ${productCount} sản phẩm đang sử dụng`
      });
    }
    
    await category.deleteOne();
    
    res.json({
      success: true,
      message: 'Đã xóa danh mục thành công'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Khởi tạo danh mục mặc định cho handmade
const initDefaultCategories = async (req, res) => {
  try {
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Đã có danh mục trong hệ thống'
      });
    }
    
    const defaultCategories = Category.getDefaultCategories();
    const createdCategories = await Category.insertMany(defaultCategories);
    
    res.status(201).json({
      success: true,
      message: 'Đã khởi tạo danh mục mặc định thành công',
      data: createdCategories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  initDefaultCategories
};