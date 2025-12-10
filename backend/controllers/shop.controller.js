const Shop = require('../models/shop.model');
const User = require('../models/user.model');

// --- HELPER: Kiểm tra số điện thoại Việt Nam ---
const isValidPhone = (phone) => {
  const regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
  return regex.test(phone);
};

// --- 1. ĐĂNG KÝ GIAN HÀNG MỚI ---
// @route POST /api/shops
const createShop = async (req, res) => {
  try {
    const { shopName, description, address, phone, avatar, coverImage } = req.body;

    // A. VALIDATION
    if (!shopName || !description || !address || !phone) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
    }
    if (shopName.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Tên gian hàng phải dài hơn 3 ký tự.' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ.' });
    }

    // B. LOGIC CHECK
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User không tồn tại.' });

    // Kiểm tra user đã có shop chưa
    const shopExists = await Shop.findOne({ user: user._id });
    if (shopExists) {
      return res.status(400).json({ success: false, message: 'Bạn đã sở hữu gian hàng rồi.' });
    }

    // Kiểm tra trùng tên shop
    const nameExists = await Shop.findOne({ shopName: shopName.trim() });
    if (nameExists) {
      return res.status(400).json({ success: false, message: 'Tên gian hàng này đã được sử dụng.' });
    }

    // C. TẠO SHOP
    const shop = await Shop.create({
      user: user._id,
      shopName: shopName.trim(),
      description: description.trim(),
      address: address.trim(),
      phone: phone.trim(),
      avatar: avatar || 'https://via.placeholder.com/150',
      coverImage: coverImage || 'https://via.placeholder.com/800x200',
      status: 'pending' // Mặc định chờ duyệt
    });

    // Cập nhật role user lên vendor (hoặc chờ admin duyệt mới lên - tuỳ logic)
    // Ở đây ta cập nhật luôn để họ truy cập được giao diện Vendor
    if (user.role === 'customer') {
      user.role = 'vendor';
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng chờ Admin phê duyệt.',
      data: shop,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 2. LẤY TẤT CẢ SHOP (Public - Có Phân trang & Tìm kiếm) ---
// @route GET /api/shops?page=1&keyword=...
const getAllShops = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    // Logic lọc: Chỉ lấy shop đang hoạt động (active)
    let keyword = {};
    if (req.query.keyword) {
      keyword = { shopName: { $regex: req.query.keyword, $options: 'i' } };
    }

    // Nếu là Admin thì có thể xem cả shop pending/rejected (Optional)
    // Ở đây mặc định public chỉ xem active
    const query = { status: 'active', ...keyword };

    const count = await Shop.countDocuments(query);
    const shops = await Shop.find(query)
      .populate('user', 'name email')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: shops,
      pagination: {
        page,
        pages: Math.ceil(count / pageSize),
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 3. XEM CHI TIẾT SHOP (Public) ---
// @route GET /api/shops/:id
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('user', 'name email');

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Gian hàng không tồn tại.' });
    }

    // Nếu shop chưa active, chỉ chủ shop hoặc admin mới xem được
    const isOwner = req.user && shop.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (shop.status !== 'active' && !isOwner && !isAdmin) {
       return res.status(403).json({ success: false, message: 'Gian hàng này đang chờ duyệt hoặc bị khoá.' });
    }

    res.json({ success: true, data: shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 4. XEM SHOP CỦA TÔI (Vendor Dashboard) ---
// @route GET /api/shops/profile
const getMyShop = async (req, res) => {
  try {
    // Tìm shop dựa trên ID của user đang đăng nhập (req.user lấy từ token)
    const shop = await Shop.findOne({ user: req.user._id });

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Bạn chưa đăng ký gian hàng.' });
    }

    res.json({ success: true, data: shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 5. CẬP NHẬT SHOP CỦA TÔI (Vendor) ---
// @route PUT /api/shops/profile
const updateShop = async (req, res) => {
  try {
    const { shopName, description, address, phone, avatar, coverImage } = req.body;

    const shop = await Shop.findOne({ user: req.user._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Gian hàng không tồn tại.' });
    }

    // Validate tên trùng nếu thay đổi tên
    if (shopName && shopName !== shop.shopName) {
        const nameExists = await Shop.findOne({ shopName: shopName.trim() });
        if (nameExists) {
            return res.status(400).json({ success: false, message: 'Tên gian hàng đã tồn tại.' });
        }
        shop.shopName = shopName.trim();
    }

    // Validate phone nếu thay đổi
    if (phone) {
        if (!isValidPhone(phone)) return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ.' });
        shop.phone = phone.trim();
    }

    if (description) shop.description = description.trim();
    if (address) shop.address = address.trim();
    if (avatar) shop.avatar = avatar;
    if (coverImage) shop.coverImage = coverImage;

    const updatedShop = await shop.save();
    res.json({ success: true, message: 'Cập nhật thành công', data: updatedShop });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 6. ADMIN DUYỆT/KHOÁ SHOP ---
// @route PATCH /api/shops/:id/status
const adminApproveShop = async (req, res) => {
  try {
    const { status } = req.body; // 'active', 'rejected', 'pending'
    const validStatuses = ['active', 'rejected', 'pending'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: 'Gian hàng không tồn tại' });

    shop.status = status;
    await shop.save();

    res.json({ success: true, message: `Đã cập nhật trạng thái shop thành: ${status}`, data: shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createShop,
  getAllShops,
  getShopById,
  getMyShop,
  updateShop,
  adminApproveShop
};