const Shop = require('../models/shop.model.js');
const User = require('../models/user.model.js'); // <-- PHẢI IMPORT 'User'

// @desc    Tạo một gian hàng (shop) mới
// @route   POST /api/shops
// @access  Private (Chỉ user đã đăng nhập)
const createShop = async (req, res) => {
    try {
        // 1. Lấy thông tin shop từ request body
        const { shopName, description } = req.body;

        // 2. Lấy thông tin user (đang đăng nhập) từ middleware 'protect'
        // Chúng ta cần user đầy đủ, không chỉ ID
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404); // 404 = Not Found
            throw new Error('Không tìm thấy người dùng');
        }

        // 3. Kiểm tra xem user này đã tạo shop bao giờ chưa
        const shopExists = await Shop.findOne({ user: user._id });

        if (shopExists) {
            res.status(400); // 400 = Bad Request
            throw new Error('Bạn đã có một gian hàng rồi.');
        }

        // 4. Nếu chưa có, tạo shop mới
        // (Trường 'status' sẽ tự động là 'pending' (chờ duyệt)
        // nhờ vào Model chúng ta đã sửa)
        const shop = await Shop.create({
            user: user._id,
            shopName,
            description,
        });

        // 5. === CẬP NHẬT QUAN TRỌNG (THEO ĐỀ CƯƠNG) ===
        // Cập nhật vai trò của user thành 'vendor'
        // Chỉ cập nhật nếu họ đang là 'customer'
        if (user.role === 'customer') {
            user.role = 'vendor';
            await user.save();
        }
        // ===========================================

        // 6. Trả về thông tin shop đã tạo
        res.status(201).json({ // 201 = Created
            _id: shop._id,
            user: shop.user,
            shopName: shop.shopName,
            description: shop.description,
            status: shop.status, // Trả về trạng thái 'pending'
            message: "Đăng ký gian hàng thành công! Vui lòng chờ Admin duyệt."
        });

    } catch (error) {
        // Gửi về lỗi (nếu có)
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createShop,
};