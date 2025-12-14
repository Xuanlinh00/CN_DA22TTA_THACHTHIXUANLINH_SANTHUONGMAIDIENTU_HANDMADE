const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import Controller
const { 
  createShop, 
  getAllShops, 
  getMyShop, 
  getShopById, 
  updateShop, 
  adminApproveShop 
} = require('../controllers/shop.controller');

// Import Middleware
const { protect, authorize } = require('../middleware/auth.middleware');

// Cấu hình multer cho upload ảnh shop
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/shops/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  }
});

// --- CÁC ROUTE (sắp xếp từ cụ thể đến chung) ---

// 1. Đăng ký shop mới (chỉ user đã login) - với upload ảnh
router.post('/', protect, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), createShop);

// 2. Shop Owner hoặc admin quản lý shop của mình (phải trước /:id)
router.get('/profile', protect, authorize('shop_owner', 'admin'), getMyShop);
router.put('/profile', protect, authorize('shop_owner', 'admin'), upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), updateShop);

// 3. Admin duyệt shop - CHỈ ADMIN (phải trước /:id)
router.patch('/:id/status', protect, authorize('admin'), adminApproveShop);

// 4. Xem chi tiết shop bất kỳ (Public)
router.get('/:id', getShopById);

// 5. Lấy danh sách tất cả shop (Public) - phải sau /:id
router.get('/', getAllShops);

module.exports = router;