const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/user.controller');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;