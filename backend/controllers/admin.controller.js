const Shop = require('../models/shop.model.js');
const User = require('../models/user.model.js');
const Order = require('../models/order.model.js');
// ✅ Sửa: Xóa validationResult không được sử dụng

// ========== QUẢN LÝ CỬA HÀNG (ADMIN) ==========

/**
 * Lấy danh sách cửa hàng đang chờ duyệt
 */
const getPendingShops = async (req, res) => {
  try {
    const shops = await Shop.find({ status: 'pending' })
      .populate('user', 'name email');
    res.status(200).json({ success: true, data: shops });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
};

// Duyệt hoặc từ chối shop
/**
 * Duyệt hoặc từ chối cửa hàng
 * - Cập nhật trạng thái shop
 * - Lưu thông tin admin duyệt
 */
const approveShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian hàng' });
    }

    const { status } = req.body;
    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    shop.status = status;
    shop.approvedBy = req.user._id;
    shop.approvedAt = Date.now();
    await shop.save();

    res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái gian hàng thành '${status}'`,
      data: shop,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể cập nhật: ' + error.message });
  }
};

// Lấy tất cả shop (có phân trang)
/**
 * Lấy danh sách tất cả cửa hàng
 * - Hỗ trợ lọc theo trạng thái
 * - Tính hoa hồng cho mỗi shop
 * - Phân trang
 */
const getAllShops = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status || 'active'; // Mặc định lấy shops active

    const query = status === 'all' ? {} : { status };

    const shops = await Shop.find(query)
      .populate('user', 'name email')
      .skip((page - 1) * limit)
      .limit(limit);

    // Tính hoa hồng cho mỗi shop từ các đơn hàng đã giao
    const shopsWithCommission = await Promise.all(shops.map(async (shop) => {
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

      const shopObj = shop.toObject();
      shopObj.totalCommission = totalCommissionOwed;
      
      // Cập nhật trạng thái dựa trên paidCommission
      const remaining = totalCommissionOwed - (shop.paidCommission || 0);
      if (remaining <= 0) {
        shopObj.commissionStatus = 'paid';
      } else if (shop.paidCommission > 0) {
        shopObj.commissionStatus = 'partial';
      } else {
        shopObj.commissionStatus = 'unpaid';
      }

      return shopObj;
    }));

    const total = await Shop.countDocuments(query);

    res.status(200).json({
      success: true,
      data: shopsWithCommission,
      pagination: { page, limit, total },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
};

// Xoá shop
/**
 * Xóa cửa hàng
 */
const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian hàng' });
    }
    res.status(200).json({ success: true, message: 'Đã xoá gian hàng thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể xoá: ' + error.message });
  }
};

// ========== QUẢN LÝ NGƯỜI DÙNG (ADMIN) ==========

/**
 * Lấy danh sách tất cả người dùng
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
};

/**
 * Xóa người dùng
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.status(200).json({ success: true, message: 'Đã xoá người dùng thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể xoá: ' + error.message });
  }
};

/**
 * Cập nhật vai trò người dùng
 * - Thay đổi role: user, shop_owner, admin
 */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'shop_owner', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Đã cập nhật vai trò người dùng thành '${role}'`,
      data: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể cập nhật vai trò: ' + error.message });
  }
};

// ========== THỐNG KÊ HỎA HỒNG (ADMIN) ==========

// Tính hoa hồng (commission) cho admin - theo % doanh thu của shop
/**
 * Tính hoa hồng từ các shop
 * - Tính 5% từ doanh thu của mỗi shop
 * - Chỉ tính từ đơn hàng đã giao
 */
const calculateCommission = async (req, res) => {
  try {
    // Lấy tất cả đơn hàng đã hoàn thành
    const completedOrders = await Order.find({ status: 'delivered' })
      .populate('items.shop', 'shopName');
    
    // Tính hoa hồng từ subtotal (không tính phí ship)
    let totalCommission = 0;
    const shopCommissions = {};

    completedOrders.forEach(order => {
      // Tính hoa hồng cho từng shop trong đơn hàng
      order.items.forEach(item => {
        const shopId = item.shop._id.toString();
        const itemCommission = item.subtotal * (order.commissionRate || 0.05); // 5% mặc định
        
        if (!shopCommissions[shopId]) {
          shopCommissions[shopId] = {
            shopName: item.shop.shopName,
            revenue: 0,
            commission: 0,
            orders: 0
          };
        }
        
        shopCommissions[shopId].revenue += item.subtotal;
        shopCommissions[shopId].commission += itemCommission;
        shopCommissions[shopId].orders += 1;
        totalCommission += itemCommission;
      });
    });

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.subtotal, 0);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalCommission,
        commissionRate: 0.05, // 5%
        shopCommissions: Object.values(shopCommissions),
        totalOrders: completedOrders.length
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tính hoa hồng: ' + error.message });
  }
};

/**
 * Lấy thống kê doanh thu tổng quát
 */
const getRevenueStats = async (req, res) => {
  try {
    const completedOrders = await Order.find({ status: 'delivered' });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.subtotal, 0);
    const totalCommission = completedOrders.reduce((sum, order) => sum + (order.commissionAmount || 0), 0);
    const totalOrders = completedOrders.length;

    res.status(200).json({
      success: true,
      data: { 
        totalRevenue, 
        totalCommission,
        totalOrders,
        commissionRate: 0.05 // 5%
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể thống kê: ' + error.message });
  }
};

/**
 * Lấy thống kê trạng thái đơn hàng
 */
const getOrderStats = async (req, res) => {
  try {
    const stats = {
      pending_payment: await Order.countDocuments({ status: 'pending' }),
      processing: await Order.countDocuments({ status: 'confirmed' }),
      shipped: await Order.countDocuments({ status: 'shipping' }),
      completed: await Order.countDocuments({ status: 'delivered' }),
      cancelled: await Order.countDocuments({ status: 'cancelled' })
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể thống kê đơn hàng: ' + error.message });
  }
};

/**
 * Lấy danh sách tất cả đơn hàng
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('❌ Error getting all orders:', error);
    res.status(500).json({ success: false, message: 'Không thể lấy danh sách đơn hàng: ' + error.message });
  }
};

/**
 * Lấy doanh thu theo tháng
 * - Hỗ trợ lọc theo năm
 */
const getMonthlyRevenue = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1, 0, 0, 0);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      const orders = await Order.find({
        status: 'delivered',
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const revenue = orders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
      const commission = orders.reduce((sum, order) => sum + (order.commissionAmount || 0), 0);
      
      monthlyData.push({
        month: month + 1,
        revenue: revenue,
        commission: commission,
        orders: orders.length
      });
    }

    res.status(200).json({ success: true, data: monthlyData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể thống kê doanh thu: ' + error.message });
  }
};

/**
 * Lấy doanh thu theo ngày
 * - Hỗ trợ lọc theo tháng/năm
 */
const getDailyRevenue = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth();
    
    const startDate = new Date(year, month, 1, 0, 0, 0);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, month, day, 0, 0, 0);
      const dayEnd = new Date(year, month, day, 23, 59, 59);

      const orders = await Order.find({
        status: 'delivered',
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      const revenue = orders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
      const commission = orders.reduce((sum, order) => sum + (order.commissionAmount || 0), 0);
      
      dailyData.push({
        day: day,
        revenue: revenue,
        commission: commission,
        orders: orders.length
      });
    }

    res.status(200).json({ success: true, data: dailyData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể thống kê doanh thu theo ngày: ' + error.message });
  }
};

/**
 * Lấy top 10 sản phẩm bán chạy nhất
 */
const getTopSellingProducts = async (req, res) => {
  try {
    // Lấy tất cả orders đã giao thành công
    const orders = await Order.find({ status: 'delivered' });

    // Tính toán sản phẩm bán chạy
    const productStats = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
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

module.exports = {
  // Shop
  getPendingShops,
  approveShop,
  getAllShops,
  deleteShop,
  // User
  getAllUsers,
  deleteUser,
  updateUserRole,
  // Orders
  getAllOrders,
  // Stats
  getRevenueStats,
  getOrderStats,
  getMonthlyRevenue,
  getDailyRevenue,
  getTopSellingProducts,
  calculateCommission,
};
