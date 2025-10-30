const Shop = require('../models/shop.model.js');

// @desc    Tạo một gian hàng (shop) mới
// @route   POST /api/shops
// @access  Private (Chỉ dành cho Vendor)
const createShop = async (req, res) => {
    try {
        // 1. Lấy thông tin shop từ request body
        const { shopName, description } = req.body;

        // 2. Lấy thông tin user (vendor) từ middleware 'protect'
        const userId = req.user._id;

        // 3. Kiểm tra xem user này đã tạo shop bao giờ chưa
        const shopExists = await Shop.findOne({ user: userId });

        if (shopExists) {
            res.status(400); // 400 = Bad Request
            throw new Error('Bạn đã có một gian hàng rồi.');
        }

        // 4. Nếu chưa có, tạo shop mới
        const shop = await Shop.create({
            user: userId,
            shopName,
            description,
            // (Trường 'avatar' sẽ lấy giá trị default như trong Model)
        });

        // 5. Trả về thông tin shop đã tạo
        res.status(201).json({ // 201 = Created
            _id: shop._id,
            user: shop.user,
            shopName: shop.shopName,
            description: shop.description,
            message: "Tạo shop thành công!"
        });

    } catch (error) {
        // Gửi về lỗi (nếu có)
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createShop,
};