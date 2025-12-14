const express = require('express');
const router = express.Router();

// 1. Import Controllers
const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  getAllUsers, // Admin
  deleteUser   // Admin
} = require('../controllers/user.controller');

// 2. Import Middleware
const { protect, authorize } = require('../middleware/auth.middleware');

// --- PUBLIC ROUTES (Không cần đăng nhập) ---

// @route   POST /api/users/register
// @desc    Đăng ký tài khoản
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Đăng nhập
router.post('/login', loginUser);

// @route   POST /api/users/forgot-password
// @desc    Gửi email reset password
router.post('/forgot-password', forgotPassword);

// @route   PUT /api/users/reset-password/:token
// @desc    Đặt lại mật khẩu mới (kèm token)
router.put('/reset-password/:token', resetPassword);


// --- PRIVATE ROUTES (Cần đăng nhập) ---

// @route   POST /api/users/logout
// @desc    Đăng xuất
router.post('/logout', protect, logoutUser);

// @route   GET /api/users/profile
// @desc    Xem thông tin cá nhân
router.get('/profile', protect, getProfile);

// @route   PUT /api/users/profile
// @desc    Cập nhật thông tin cá nhân
router.put('/profile', protect, updateProfile);


// --- ADMIN ROUTES (Cần quyền Admin) ---

// @route   GET /api/users
// @desc    Lấy danh sách tất cả user
router.get('/', protect, authorize('admin'), getAllUsers);

// @route   DELETE /api/users/:id
// @desc    Xoá người dùng theo ID
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;