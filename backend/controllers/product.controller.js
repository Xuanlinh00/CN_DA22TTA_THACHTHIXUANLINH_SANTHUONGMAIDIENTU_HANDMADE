const Product = require('../models/product.model.js');
const Shop = require('../models/shop.model.js');
// (Chúng ta sẽ cần Category model sau)

// @desc    Vendor (Chủ shop) tạo một sản phẩm mới
// @route   POST /api/products
// @access  Private (Chỉ Vendor)
const createProduct = async (req, res) => {
    try {
        // 1. Lấy thông tin sản phẩm từ request body
        const { name, description, price, category, stockQuantity, image } = req.body;

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

        // 5. Tạo sản phẩm mới
        const product = await Product.create({
            user: userId, // ID của chủ shop
            shop: shop._id, // ID của gian hàng
            name,
            description,
            price,
            category, // (Tạm thời chúng ta sẽ truyền ID của category)
            stockQuantity,
            image: image || '/images/default-product.png',
        });

        // 6. Trả về sản phẩm đã tạo
        res.status(201).json(product); // 201 = Created

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// === THÊM CÁC HÀM MỚI CHO TUẦN 2 (Khách hàng) ===

// @desc    Lấy tất cả sản phẩm (cho Khách hàng)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        // Chỉ lấy các sản phẩm từ các shop đã 'active'
        // 1. Tìm tất cả shop đã 'active'
        const activeShops = await Shop.find({ status: 'active' }).select('_id');
        const activeShopIds = activeShops.map(shop => shop._id);

        // 2. Tìm tất cả sản phẩm thuộc các shop 'active' đó
        // .populate('shop', 'shopName') -> Lấy kèm tên của shop
        const products = await Product.find({ shop: { $in: activeShopIds } }).populate(
            'shop',
            'shopName'
        );

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
        const product = await Product.findById(req.params.id).populate(
            'shop',
            'shopName status' // Lấy kèm tên shop và trạng thái shop
        );

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
// ===============================================

// Cập nhật lại module.exports để export cả 3 hàm
module.exports = {
    createProduct,
    getProducts,
    getProductById,
};