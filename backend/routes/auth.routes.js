const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
} = require('../controllers/user.controller');

// @route   POST /api/auth/register
// @desc    Đăng ký user mới
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Đăng nhập
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/auth/logout
// @desc    Đăng xuất
// @access  Private
router.post('/logout', protect, logoutUser);

// @route   GET /api/auth/profile
// @desc    Lấy thông tin cá nhân
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/auth/profile
// @desc    Cập nhật thông tin cá nhân
// @access  Private
router.put('/profile', protect, updateProfile);

module.exports = router;
