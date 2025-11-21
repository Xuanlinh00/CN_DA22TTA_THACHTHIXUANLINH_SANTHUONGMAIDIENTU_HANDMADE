const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
} = require('../controllers/user.controller'); // Import Controller
const { protect, authorize } = require('../middleware/auth.middleware');

// @route   POST /api/users/register
// @desc    Đăng ký tài khoản mới

router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Đăng nhập và nhận token

router.post('/login', loginUser);

// @route   POST /api/users/logout
// @desc    Đăng xuất (xóa cookie chứa JWT)

router.post('/logout', protect, logoutUser);

// @route   GET /api/users/profile
// @desc    Lấy thông tin cá nhân của user

router.get('/profile', protect, getProfile);

// @route   PUT /api/users/profile
// @desc    Cập nhật thông tin cá nhân của user

router.put('/profile', protect, updateProfile);

// @route   GET /api/users
// @desc    Admin lấy danh sách tất cả người dùng

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await require('../models/user.model').find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách người dùng' });
  }
});

module.exports = router;
