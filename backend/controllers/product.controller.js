const Product = require('../models/product.model.js');
const Shop = require('../models/shop.model.js');
const Category = require('../models/category.model.js'); // Import Category

// @desc    Vendor (Chủ shop) tạo một sản phẩm mới
// @route   POST /api/products
// @access  Private (Chỉ Vendor)
const createProduct = async (req, res) => {
    try {
        // 1. Lấy thông tin sản phẩm từ request body (ĐÃ CẬP NHẬT THEO ERD)
        const { name, description, price, categoryId, stockQuantity, image, material } = req.body;

        // 2. Lấy thông tin user (vendor) từ middleware 'protect'
        const userId = req.user._id;

        // 3. Tìm gian hàng (shop) của vendor này
        const shop = await Shop.findOne({ user: userId });

        if (!shop) {
            res.status(404); // 404 = Not Found
            throw new Error('Không tìm thấy gian hàng của bạn.');
        }

        // 4. [QUAN TRỌNG] Kiểm tra xem shop đã được Admin duyệt chưa
        if (shop.status !== 'active') {
            res.status(403); // 403 = Forbidden
            throw new Error('Gian hàng của bạn chưa được duyệt. Không thể đăng sản phẩm.');
        }
        
        // 5. Kiểm tra xem Category ID có hợp lệ không
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            res.status(400);
            throw new Error('Danh mục (Category) không hợp lệ.');
        }

        // 6. Tạo sản phẩm mới
        const product = await Product.create({
            user: userId, // ID của chủ shop
            shop: shop._id, // ID của gian hàng
            name,
            description,
            price,
            category: categoryId, // Gán ID của category
            stockQuantity,
            image: image || undefined, // Nếu không có ảnh thì lấy default
            material: material || undefined, // <-- MỚI TỪ ERD
        });

        // 7. Trả về sản phẩm đã tạo
        res.status(201).json(product); // 201 = Created

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Lấy tất cả sản phẩm (cho Khách hàng)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        // Chỉ lấy các sản phẩm từ các shop đã 'active'
        const activeShops = await Shop.find({ status: 'active' }).select('_id');
        const activeShopIds = activeShops.map(shop => shop._id);

        // Tìm tất cả sản phẩm thuộc các shop 'active'
        const products = await Product.find({ shop: { $in: activeShopIds } })
            .populate('shop', 'shopName')
            .populate('category', 'name'); // Lấy kèm tên shop và tên category

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
            .populate('shop', 'shopName status') // Lấy kèm tên shop và trạng thái
            .populate('category', 'name'); // Lấy kèm tên category

        if (!product) {
            res.status(404); // 404 = Not Found
            throw new Error('Không tìm thấy sản phẩm');
        }

        // Kiểm tra xem shop của sản phẩm này có 'active' không
        if (product.shop.status !== 'active') {
            res.status(403); // 403 = Forbidden
            throw new Error('Gian hàng này chưa được duyệt');
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật lại module.exports
module.exports = {
    createProduct,
    getProducts,
    getProductById,
};