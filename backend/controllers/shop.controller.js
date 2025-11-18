const Shop = require('../models/shop.model.js');
const User = require('../models/user.model.js'); // Import User model

// @desc    Tạo một gian hàng (shop) mới
// @route   POST /api/shops
// @access  Private (Chỉ user đã đăng nhập)
const createShop = async (req, res) => {
    try {
        // 1. Lấy thông tin shop từ request body (ĐÃ CẬP NHẬT THEO ERD)
        const { shopName, description, address, phone, avatar, coverImage } = req.body;

        // 2. Lấy thông tin user (đang đăng nhập)
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error('Không tìm thấy người dùng');
        }

        // 3. Kiểm tra xem user này đã tạo shop bao giờ chưa
        const shopExists = await Shop.findOne({ user: user._id });

        if (shopExists) {
            res.status(400); // 400 = Bad Request
            throw new Error('Bạn đã có một gian hàng rồi.');
        }

        // 4. KIỂM TRA DỮ LIỆU MỚI (Từ ERD)
        if (!address || !phone) {
             res.status(400);
             throw new Error('Vui lòng cung cấp địa chỉ và số điện thoại cho gian hàng.');
        }

        // 5. Nếu chưa có, tạo shop mới
        const shop = await Shop.create({
            user: user._id,
            shopName,
            description,
            address, // <-- MỚI
            phone,   // <-- MỚI
            avatar: avatar || undefined, // (Nếu không gửi thì lấy default)
            coverImage: coverImage || undefined, // (Nếu không gửi thì lấy default)
            // (Trường 'status' sẽ tự động là 'pending')
        });

        // 6. Cập nhật vai trò của user thành 'vendor'
        if (user.role === 'customer') {
            user.role = 'vendor';
            await user.save();
        }

        // 7. Trả về thông tin shop đã tạo
        res.status(201).json({
            _id: shop._id,
            user: shop.user,
            shopName: shop.shopName,
            description: shop.description,
            address: shop.address, // <-- MỚI
            phone: shop.phone,     // <-- MỚI
            status: shop.status, 
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