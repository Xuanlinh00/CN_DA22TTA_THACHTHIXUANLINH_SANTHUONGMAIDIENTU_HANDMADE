const Shop = require('../models/shop.model');
const User = require('../models/user.model');

// @desc    Tạo một gian hàng (shop) mới
// @route   POST /api/shops
// @access  Private (Chỉ user đã đăng nhập)
const createShop = async (req, res) => {
  try {
    const { shopName, description, address, phone, avatar, coverImage } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!shopName || !description || !address || !phone) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin gian hàng' });
    }

    // 2. Lấy thông tin user (đang đăng nhập)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // 3. Kiểm tra xem user này đã có shop chưa
    const shopExists = await Shop.findOne({ user: user._id });
    if (shopExists) {
      return res.status(400).json({ message: 'Bạn đã có một gian hàng rồi' });
    }

    // 4. Tạo shop mới
    const shop = await Shop.create({
      user: user._id,
      shopName: shopName.trim(),
      description: description.trim(),
      address: address.trim(),
      phone: phone.trim(),
      avatar: avatar || '/images/default-shop.png',
      coverImage: coverImage || '/images/default-cover.png',
      // status mặc định là 'pending' trong model
    });

    // 5. Cập nhật vai trò của user thành 'vendor'
    if (user.role === 'customer') {
      user.role = 'vendor';
      await user.save();
    }

    // 6. Trả về thông tin shop đã tạo
    res.status(201).json({
      _id: shop._id,
      user: shop.user,
      shopName: shop.shopName,
      description: shop.description,
      address: shop.address,
      phone: shop.phone,
      avatar: shop.avatar,
      coverImage: shop.coverImage,
      status: shop.status,
      message: 'Đăng ký gian hàng thành công! Vui lòng chờ Admin duyệt.',
    });
  } catch (error) {
    console.error('Lỗi tạo gian hàng:', error.message);
    res.status(500).json({ message: 'Không thể tạo gian hàng, vui lòng thử lại sau' });
  }
};

module.exports = {
  createShop,
};
