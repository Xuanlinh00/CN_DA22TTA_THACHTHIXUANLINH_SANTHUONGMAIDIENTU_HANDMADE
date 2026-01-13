const Shop = require('../models/shop.model');
const User = require('../models/user.model');

// ========== HELPER FUNCTIONS ==========

/**
 * Kiểm tra số điện thoại Việt Nam hợp lệ
 * @param {string} phone - Số điện thoại
 * @returns {boolean}
 */
const isValidPhone = (phone) => {
  const regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
  return regex.test(phone);
};

// ========== QUẢN LÝ CỬA HÀNG ==========

/**
 * 1. ĐĂNG KÝ GIAN HÀNG MỚI
 * - Kiểm tra user chưa có shop
 * - Kiểm tra tên shop không trùng
 * - Upload ảnh avatar và cover image
 * - Trạng thái mặc định: pending (chờ admin duyệt)
 * - Cập nhật role user thành shop_owner
 */
const createShop = async (req, res) => {
  try {
    const { shopName, description, street, ward, district, city, phone } = req.body;

    // A. VALIDATION
    if (!shopName || !description || !street || !ward || !district || !city || !phone) {
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

    // C. Xử lý upload ảnh
    let avatar = 'https://via.placeholder.com/150';
    let coverImage = 'https://via.placeholder.com/800x200';

    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        avatar = `/uploads/shops/${req.files.avatar[0].filename}`;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        coverImage = `/uploads/shops/${req.files.coverImage[0].filename}`;
      }
    }

    // D. TẠO SHOP
    const shop = await Shop.create({
      user: user._id,
      shopName: shopName.trim(),
      description: description.trim(),
      address: {
        street: street.trim(),
        ward: ward.trim(),
        district: district.trim(),
        city: city.trim()
      },
      phone: phone.trim(),
      avatar,
      coverImage,
      status: 'pending' // Mặc định chờ duyệt
    });

    // Cập nhật role user lên shop_owner
    if (user.role === 'user') {
      user.role = 'shop_owner';
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
/**
 * 2. LẤY DANH SÁCH CỬA HÀNG
 * - Chỉ lấy shop đang hoạt động (active)
 * - Hỗ trợ tìm kiếm theo tên
 * - Phân trang
 */
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
/**
 * 3. LẤY THÔNG TIN CHI TIẾT CỬA HÀNG
 * - Nếu shop chưa active, chỉ chủ shop hoặc admin mới xem được
 */
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('user', 'name email avatar role _id');

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Gian hàng không tồn tại.' });
    }

    // Nếu shop chưa active, chỉ chủ shop hoặc admin mới xem được
    const isOwner = req.user && shop.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (shop.status !== 'active' && !isOwner && !isAdmin) {
       return res.status(403).json({ success: false, message: 'Gian hàng này đang chờ duyệt hoặc bị khoá.' });
    }

    // Thêm owner field để frontend dễ sử dụng
    const shopData = shop.toObject();
    shopData.owner = shop.user;

    res.json({ success: true, data: shopData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 4. XEM SHOP CỦA TÔI (Vendor Dashboard) ---
// @route GET /api/shops/profile
/**
 * 4. LẤY THÔNG TIN SHOP CỦA SHOP OWNER
 * - Lấy shop dựa trên ID user đang đăng nhập
 */
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
/**
 * 5. CẬP NHẬT THÔNG TIN SHOP
 * - Shop owner cập nhật thông tin gian hàng
 * - Kiểm tra tên shop không trùng
 * - Upload ảnh avatar và cover image
 */
const updateShop = async (req, res) => {
  try {
    const { shopName, description, street, ward, district, city, phone } = req.body;

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
    
    // Cập nhật địa chỉ
    if (street) shop.address.street = street.trim();
    if (ward) shop.address.ward = ward.trim();
    if (district) shop.address.district = district.trim();
    if (city) shop.address.city = city.trim();

    // Xử lý upload ảnh
    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        shop.avatar = `/uploads/shops/${req.files.avatar[0].filename}`;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        shop.coverImage = `/uploads/shops/${req.files.coverImage[0].filename}`;
      }
    }

    const updatedShop = await shop.save();
    res.json({ success: true, message: 'Cập nhật thành công', data: updatedShop });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 6. ADMIN DUYỆT/KHOÁ SHOP ---
// @route PATCH /api/shops/:id/status
/**
 * 6. ADMIN DUYỆT HOẶC TỪ CHỐI CỬA HÀNG
 * - Cập nhật trạng thái shop (active, rejected, pending)
 */
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

// --- 7. LẤY DOANH THU THEO THÁNG (Shop Owner) ---
// @route GET /api/shops/stats/monthly-revenue
/**
 * 7. THỐNG KÊ DOANH THU THEO THÁNG
 * - Tính doanh thu từ các đơn hàng đã giao
 * - Chỉ tính sản phẩm của shop này
 * - Trả về dữ liệu 12 tháng
 */
const getMonthlyRevenue = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const monthlyData = [];
    const shop = await Shop.findOne({ user: req.user._id });

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Gian hàng không tồn tại' });
    }

    const Order = require('../models/order.model');

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0, 23, 59, 59);

      // Tìm tất cả orders có items từ shop này và status là delivered
      const orders = await Order.find({
        status: 'delivered',
        createdAt: { $gte: startDate, $lte: endDate },
        'items.shop': shop._id
      });

      // Tính doanh thu từ items của shop này
      let revenue = 0;
      let orderCount = 0;
      
      orders.forEach(order => {
        const shopItems = order.items.filter(item => item.shop.toString() === shop._id.toString());
        if (shopItems.length > 0) {
          revenue += shopItems.reduce((sum, item) => sum + item.subtotal, 0);
          orderCount++;
        }
      });
      
      monthlyData.push({
        month: month + 1,
        revenue: revenue,
        orders: orderCount
      });
    }

    console.log('📊 Monthly Revenue Data for shop', shop._id, ':', monthlyData);
    res.status(200).json({ success: true, data: monthlyData });
  } catch (error) {
    console.error('❌ Error getting monthly revenue:', error);
    res.status(500).json({ success: false, message: 'Không thể thống kê doanh thu: ' + error.message });
  }
};

// --- 7.5 LẤY DOANH THU THEO NGÀY (Shop Owner) ---
// @route GET /api/shops/stats/daily-revenue
/**
 * 7.5 THỐNG KÊ DOANH THU THEO NGÀY
 * - Tính doanh thu từ các đơn hàng đã giao
 * - Hỗ trợ lọc theo tháng/năm
 */
const getDailyRevenue = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const month = Number(req.query.month) || currentMonth;
    const year = Number(req.query.year) || currentYear;
    
    const shop = await Shop.findOne({ user: req.user._id });

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Gian hàng không tồn tại' });
    }

    const Order = require('../models/order.model');
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, month, day, 0, 0, 0);
      const dayEnd = new Date(year, month, day, 23, 59, 59);

      const orders = await Order.find({
        status: 'delivered',
        createdAt: { $gte: dayStart, $lte: dayEnd },
        'items.shop': shop._id
      });

      let revenue = 0;
      let orderCount = 0;
      
      orders.forEach(order => {
        const shopItems = order.items.filter(item => item.shop.toString() === shop._id.toString());
        if (shopItems.length > 0) {
          revenue += shopItems.reduce((sum, item) => sum + item.subtotal, 0);
          orderCount++;
        }
      });
      
      dailyData.push({
        day: day,
        revenue: revenue,
        orders: orderCount
      });
    }

    res.status(200).json({ success: true, data: dailyData });
  } catch (error) {
    console.error('❌ Error getting daily revenue:', error);
    res.status(500).json({ success: false, message: 'Không thể thống kê doanh thu theo ngày: ' + error.message });
  }
};

// --- 8. LẤY SẢN PHẨM BÁN CHẠY CỦA SHOP (Shop Owner) ---
// @route GET /api/shops/stats/top-selling-products
/**
 * 8. LẤY TOP 10 SẢN PHẨM BÁN CHẠY
 * - Tính từ các đơn hàng đã giao
 * - Sắp xếp theo số lượng bán
 */
const getTopSellingProducts = async (req, res) => {
  try {
    const shop = await Shop.findOne({ user: req.user._id });

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Gian hàng không tồn tại' });
    }

    const Order = require('../models/order.model');
    const Product = require('../models/product.model');

    // Lấy tất cả orders đã giao thành công
    const orders = await Order.find({
      status: 'delivered',
      'items.shop': shop._id
    });

    // Tính toán sản phẩm bán chạy
    const productStats = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (item.shop.toString() === shop._id.toString()) {
          const productId = item.product?._id || item.product;
          if (!productStats[productId]) {
            productStats[productId] = {
              productId,
              name: item.name,
              image: item.image,
              quantity: 0,
              revenue: 0,
              price: item.price
            };
          }
          productStats[productId].quantity += item.quantity;
          productStats[productId].revenue += item.subtotal;
        }
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.status(200).json({ success: true, data: topProducts });
  } catch (error) {
    console.error('❌ Error getting top selling products:', error);
    res.status(500).json({ success: false, message: 'Không thể lấy sản phẩm bán chạy: ' + error.message });
  }
};

// --- 9. LẤY THÔNG TIN HỎA HỒNG (Shop Owner) ---
// @route GET /api/shops/commission
/**
 * 9. THỐNG KÊ HỎA HỒNG
 * - Tính hoa hồng phải trả (5% doanh thu)
 * - Tính hoa hồng đã trả
 * - Tính hoa hồng còn lại
 */
const getCommission = async (req, res) => {
  try {
    const shop = await Shop.findOne({ user: req.user._id });

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Gian hàng không tồn tại' });
    }

    // Tính toán hoa hồng từ các đơn hàng đã giao
    const Order = require('../models/order.model');
    
    const orders = await Order.find({
      status: 'delivered',
      'items.shop': shop._id
    });

    // Tính tổng hoa hồng phải trả (5% của subtotal)
    let totalCommissionOwed = 0;
    orders.forEach(order => {
      const shopItems = order.items.filter(item => item.shop.toString() === shop._id.toString());
      if (shopItems.length > 0) {
        const shopSubtotal = shopItems.reduce((sum, item) => sum + item.subtotal, 0);
        totalCommissionOwed += shopSubtotal * 0.05; // 5% commission
      }
    });

    // Hoa hồng kiếm được = Tổng hoa hồng phải trả - Đã trả
    const commissionEarned = totalCommissionOwed - (shop.paidCommission || 0);

    res.json({
      success: true,
      data: {
        totalCommission: totalCommissionOwed, // Tổng hoa hồng phải trả cho admin
        paidCommission: shop.paidCommission || 0, // Đã trả cho admin
        commissionEarned: commissionEarned, // Hoa hồng kiếm được (có thể rút)
        commissionStatus: shop.commissionStatus || 'unpaid',
        commissionPaidAt: shop.commissionPaidAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 10. YÊU CẦU RÚT TIỀN HỎA HỒNG (Shop Owner) ---
// @route POST /api/shops/commission/withdraw
// --- 11. THANH TOÁN HỎA HỒNG CHO QUẢN TRỊ (Shop Owner) ---
// @route POST /api/shops/commission/pay
/**
 * 11. THANH TOÁN HỎA HỒNG
 * - Kiểm tra số tiền hợp lệ
 * - Cập nhật paidCommission
 * - Cập nhật trạng thái hoa hồng
 */
const payCommission = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ' });
    }

    const shop = await Shop.findOne({ user: req.user._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Gian hàng không tồn tại' });
    }

    // Tính toán hoa hồng từ các đơn hàng đã giao
    const Order = require('../models/order.model');
    
    const orders = await Order.find({
      status: 'delivered',
      'items.shop': shop._id
    });

    // Tính tổng hoa hồng phải trả
    let totalCommissionOwed = 0;
    orders.forEach(order => {
      const shopItems = order.items.filter(item => item.shop.toString() === shop._id.toString());
      if (shopItems.length > 0) {
        const shopSubtotal = shopItems.reduce((sum, item) => sum + item.subtotal, 0);
        totalCommissionOwed += shopSubtotal * 0.05; // 5% commission
      }
    });

    if (amount > totalCommissionOwed) {
      return res.status(400).json({ 
        success: false, 
        message: `Số tiền thanh toán không được vượt quá ${totalCommissionOwed}` 
      });
    }

    // Cập nhật paidCommission trên Shop
    shop.paidCommission = (shop.paidCommission || 0) + amount;
    shop.commissionPaidAt = new Date();
    
    // Cập nhật trạng thái
    if (shop.paidCommission >= totalCommissionOwed) {
      shop.commissionStatus = 'paid';
    } else if (shop.paidCommission > 0) {
      shop.commissionStatus = 'partial';
    }
    
    await shop.save();

    // Tạo payment request
    const CommissionPayment = require('../models/commissionPayment.model');
    
    const payment = await CommissionPayment.create({
      shop: shop._id,
      amount,
      status: 'completed',
      requestedAt: new Date(),
      completedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Thanh toán hoa hồng thành công',
      data: payment
    });
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
  adminApproveShop,
  getMonthlyRevenue,
  getDailyRevenue,
  getTopSellingProducts,
  getCommission,
  payCommission
};