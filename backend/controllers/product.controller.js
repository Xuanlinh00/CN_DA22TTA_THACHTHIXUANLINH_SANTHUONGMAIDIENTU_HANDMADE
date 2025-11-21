const Product = require('../models/product.model');
const Shop = require('../models/shop.model');
const Category = require('../models/category.model');

// @desc    Vendor (Chủ shop) tạo một sản phẩm mới
// @route   POST /api/products
// @access  Private (Vendor)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, categoryId, stockQuantity, image, material } = req.body;
    const userId = req.user._id;

    const shop = await Shop.findOne({ user: userId });
    if (!shop) {
      return res.status(404).json({ message: 'Không tìm thấy gian hàng của bạn' });
    }

    if (shop.status !== 'active') {
      return res.status(403).json({ message: 'Gian hàng của bạn chưa được duyệt. Không thể đăng sản phẩm' });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Danh mục (Category) không hợp lệ' });
    }

    const product = await Product.create({
      user: userId,
      shop: shop._id,
      name: name.trim(),
      description: description.trim(),
      price,
      category: categoryId,
      stockQuantity,
      image: image || '/images/default-product.png',
      material: material || '',
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Lấy tất cả sản phẩm (cho Khách hàng)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const activeShops = await Shop.find({ status: 'active' }).select('_id');
    const activeShopIds = activeShops.map(shop => shop._id);

    const products = await Product.find({ shop: { $in: activeShopIds } })
      .populate('shop', 'shopName')
      .populate('category', 'name');

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// @desc    Lấy 1 sản phẩm bằng ID (cho Khách hàng)
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shop', 'shopName status')
      .populate('category', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    if (product.shop.status !== 'active') {
      return res.status(403).json({ message: 'Gian hàng này chưa được duyệt' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Vendor cập nhật sản phẩm của mình
// @route   PUT /api/products/:id
// @access  Private (Vendor)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Chỉ cho phép vendor chỉnh sửa sản phẩm của chính mình
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa sản phẩm này' });
    }

    const fields = ['name', 'description', 'price', 'stockQuantity', 'image', 'material', 'category'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Không thể cập nhật sản phẩm' });
  }
};

// @desc    Vendor xóa sản phẩm của mình
// @route   DELETE /api/products/:id
// @access  Private (Vendor)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa sản phẩm này' });
    }

    await product.remove();
    res.status(200).json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Không thể xóa sản phẩm' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
