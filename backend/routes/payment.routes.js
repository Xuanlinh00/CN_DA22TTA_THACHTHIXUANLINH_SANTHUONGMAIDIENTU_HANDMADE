const express = require('express');
const router = express.Router();
const {
  createPaymentUrl,
  vnpayReturn,
  vnpayIPN,
  getBankList
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

// Tạo URL thanh toán VNPAY
router.post('/vnpay/create-payment', protect, createPaymentUrl);

// Callback từ VNPAY (return URL)
router.get('/vnpay/return', vnpayReturn);

// IPN từ VNPAY
router.get('/vnpay/ipn', vnpayIPN);

// Lấy danh sách ngân hàng
router.get('/vnpay/banks', getBankList);

module.exports = router;