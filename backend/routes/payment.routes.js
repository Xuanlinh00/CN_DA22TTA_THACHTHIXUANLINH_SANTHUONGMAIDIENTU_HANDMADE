// routes/payment.routes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
require('dotenv').config();

const VNP_TMN_CODE = process.env.VNP_TMN_CODE;
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET;
const VNP_URL = process.env.VNP_URL;
const VNP_RETURN_URL = process.env.VNP_RETURN_URL;

// Tạo link thanh toán VNPAY
router.post('/create-payment', async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: VNP_TMN_CODE,
      vnp_Amount: amount * 100, // VNPAY dùng đơn vị "xu" = VND * 100
      vnp_CreateDate: new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14),
      vnp_CurrCode: 'VND',
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: VNP_RETURN_URL,
      vnp_TxnRef: orderId.toString(),
    };

    // Sắp xếp params theo thứ tự alphabet
    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`)
      .join('&');

    // Tạo chữ ký
    const signData = crypto.createHmac('sha512', VNP_HASH_SECRET)
      .update(sortedParams)
      .digest('hex');

    vnp_Params.vnp_SecureHash = signData;

    const paymentUrl = `${VNP_URL}?${new URLSearchParams(vnp_Params).toString()}`;

    res.json({ success: true, paymentUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Callback từ VNPAY
router.get('/vnpay-return', (req, res) => {
  let vnp_Params = req.query;
  let secureHash = vnp_Params.vnp_SecureHash;

  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .map(key => `${key}=${vnp_Params[key]}`)
    .join('&');

  const signData = crypto.createHmac('sha512', VNP_HASH_SECRET)
    .update(sortedParams)
    .digest('hex');

  if (secureHash === signData) {
    // Thanh toán thành công
    res.redirect(`${process.env.CLIENT_URL}/payment-success?orderId=${vnp_Params.vnp_TxnRef}`);
  } else {
    res.redirect(`${process.env.CLIENT_URL}/payment-fail`);
  }
});

module.exports = router;