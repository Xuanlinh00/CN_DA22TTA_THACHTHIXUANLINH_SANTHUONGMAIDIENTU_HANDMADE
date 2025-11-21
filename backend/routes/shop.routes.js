const express = require('express');
const router = express.Router();
const { createShop } = require('../controllers/shop.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// @route   POST /api/shops
// @desc    User đăng ký tạo gian hàng mới
// @access  Private (chỉ user đã đăng nhập, chưa có shop)
router.post('/', protect, createShop);

// 🚀 Gợi ý mở rộng thêm các API khác cho Shop
// @route   GET /api/shops
// @desc    Lấy danh sách tất cả gian hàng (Public)
router.get('/', async (req, res) => {
  try {
    const shops = await require('../models/shop.model').find().populate('user', 'name email');
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách gian hàng' });
  }
});

// @route   GET /api/shops/:id
// @desc    Lấy thông tin chi tiết một gian hàng
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const shop = await require('../models/shop.model').findById(req.params.id).populate('user', 'name email');
    if (!shop) {
      return res.status(404).json({ message: 'Không tìm thấy gian hàng' });
    }
    res.status(200).json(shop);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy thông tin gian hàng' });
  }
});

// @route   PUT /api/shops/:id
// @desc    Vendor cập nhật thông tin gian hàng của mình
// @access  Private (Vendor)
router.put('/:id', protect, authorize('vendor'), async (req, res) => {
  try {
    const shop = await require('../models/shop.model').findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Không tìm thấy gian hàng' });
    }

    // Chỉ cho phép vendor cập nhật shop của chính mình
    if (shop.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa gian hàng này' });
    }

    const updates = ['shopName', 'description', 'address', 'phone', 'avatar', 'coverImage'];
    updates.forEach((field) => {
      if (req.body[field] !== undefined) {
        shop[field] = req.body[field];
      }
    });

    const updatedShop = await shop.save();
    res.status(200).json(updatedShop);
  } catch (error) {
    res.status(500).json({ message: 'Không thể cập nhật gian hàng' });
  }
});

// @route   PATCH /api/shops/:id/status
// @desc    Admin duyệt hoặc từ chối gian hàng
// @access  Private (Admin)
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const shop = await require('../models/shop.model').findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Không tìm thấy gian hàng' });
    }

    shop.status = req.body.status || shop.status; // pending, approved, rejected
    const updatedShop = await shop.save();

    res.status(200).json({ message: 'Cập nhật trạng thái gian hàng thành công', shop: updatedShop });
  } catch (error) {
    res.status(500).json({ message: 'Không thể cập nhật trạng thái gian hàng' });
  }
});

module.exports = router;
