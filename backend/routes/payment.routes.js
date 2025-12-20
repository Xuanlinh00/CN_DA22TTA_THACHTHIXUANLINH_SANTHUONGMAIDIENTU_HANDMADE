const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createVNPayPayment,
  vnpayReturn,
  vnpayIPN
} = require('../controllers/payment.controller');

// Tạo URL thanh toán VNPAY (Yêu cầu đăng nhập)
router.post('/vnpay/create', protect, createVNPayPayment);

// Callback từ VNPAY (user redirect về - KHÔNG cần protect vì VNPAY gọi)
router.get('/vnpay/return', vnpayReturn);

// IPN từ VNPAY (server to server - KHÔNG cần protect)
router.get('/vnpay/ipn', vnpayIPN);

module.exports = router;