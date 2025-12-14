const Shop = require('../models/shop.model.js');
const User = require('../models/user.model.js');
const Order = require('../models/order.model.js');
const { validationResult } = require('express-validator'); // Cài npm i express-validator
// quản lý shop
// Lấy tất cả shop đang chờ duyệt
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
const getAllShops = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const shops = await Shop.find()
      .populate('user', 'name email')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Shop.countDocuments();

    res.status(200).json({
      success: true,
      data: shops,
      pagination: { page, limit, total },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
};

// Xoá shop
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

// quaen lý user

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
};

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

// Tính hoa hồng (commission) cho admin
const calculateCommission = async (req, res) => {
  try {
    const completedOrders = await Order.find({ orderStatus: 'completed' });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const commissionRate = 0.1; // 10%
    const commission = totalRevenue * commissionRate;

    res.status(200).json({
      success: true,
      data: { totalRevenue, commission },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tính hoa hồng: ' + error.message });
  }
};

const getRevenueStats = async (req, res) => {
  try {
    const completedOrders = await Order.find({ orderStatus: 'completed' });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = completedOrders.length;

    res.status(200).json({
      success: true,
      data: { totalRevenue, totalOrders },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể thống kê: ' + error.message });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const statuses = ['pending_payment', 'processing', 'shipped', 'completed', 'cancelled'];
    const stats = {};

    for (const status of statuses) {
      stats[status] = await Order.countDocuments({ orderStatus: status });
    }

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể thống kê đơn hàng: ' + error.message });
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
  // Stats
  getRevenueStats,
  getOrderStats,
calculateCommission,
};
