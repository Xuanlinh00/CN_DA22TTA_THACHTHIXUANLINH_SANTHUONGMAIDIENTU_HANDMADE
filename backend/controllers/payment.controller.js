const Order = require('../models/order.model');
const vnpayService = require('../services/vnpay.service');

/**
 * Tạo URL thanh toán VNPAY
 * POST /api/payment/vnpay/create
 */
const createVNPayPayment = async (req, res) => {
  try {
    const { orderId, bankCode } = req.body;

    // Tìm đơn hàng
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra quyền sở hữu đơn hàng
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thanh toán đơn hàng này' });
    }

    // Kiểm tra đơn hàng đã thanh toán chưa
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Đơn hàng đã được thanh toán' });
    }

    // Lấy IP của client
    let ipAddr = req.headers['x-forwarded-for'] ||
                 req.connection.remoteAddress ||
                 req.socket.remoteAddress ||
                 req.connection.socket.remoteAddress;

    // FIX: Xử lý trường hợp chạy localhost trả về IPv6 (::1)
    if (ipAddr === '::1') {
        ipAddr = '127.0.0.1';
    }

    // Tạo URL thanh toán
    const paymentUrl = vnpayService.createPaymentUrl({
      orderId: order._id.toString(),
      amount: order.totalPrice,
      orderInfo: `Thanh toan don hang ${order.orderNumber}`,
      ipAddr: ipAddr,
      bankCode: bankCode || ''
    });

    res.status(200).json({
      success: true,
      message: 'Tạo URL thanh toán thành công',
      data: { paymentUrl }
    });

  } catch (error) {
    console.error('❌ Lỗi tạo thanh toán VNPAY:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo thanh toán: ' + error.message
    });
  }
};

/**
 * Xử lý callback từ VNPAY (user redirect về)
 * GET /api/payment/vnpay/return
 */
const vnpayReturn = async (req, res) => {
  try {
    const vnpParams = req.query;
    console.log('📥 VNPAY Return Params:', vnpParams);

    // Xác thực callback
    const result = vnpayService.verifyReturnUrl(vnpParams);

    // URL chuyển hướng về frontend (lấy từ .env hoặc cứng)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (!result.isValid) {
      return res.redirect(`${clientUrl}/payment/result?success=false&message=${encodeURIComponent(result.message)}`);
    }

    // Tìm đơn hàng
    const order = await Order.findById(result.orderId);
    if (!order) {
      return res.redirect(`${clientUrl}/payment/result?success=false&message=${encodeURIComponent('Không tìm thấy đơn hàng')}`);
    }

    // Xử lý kết quả giao dịch
    if (result.isSuccess) {
      // Cập nhật trạng thái thanh toán thành công
      if (order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.paymentMethod = 'VNPAY';
          order.vnpayData = {
            transactionNo: result.transactionNo,
            bankCode: result.bankCode,
            payDate: result.payDate,
            responseCode: result.responseCode,
            transactionStatus: 'success'
          };
          await order.save();
      }
      console.log('✅ Thanh toán VNPAY thành công:', order.orderNumber);
      return res.redirect(`${clientUrl}/payment/result?success=true&orderId=${order._id}&orderNumber=${order.orderNumber}`);

    } else {
      // Thanh toán thất bại
      order.paymentStatus = 'failed';
      order.vnpayData = {
        responseCode: result.responseCode,
        transactionStatus: 'failed'
      };
      await order.save();
      console.log('❌ Thanh toán VNPAY thất bại:', result.message);
      return res.redirect(`${clientUrl}/payment/result?success=false&message=${encodeURIComponent(result.message)}&orderId=${order._id}`);
    }

  } catch (error) {
    console.error('❌ Lỗi xử lý VNPAY return:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/payment/result?success=false&message=${encodeURIComponent('Lỗi xử lý thanh toán')}`);
  }
};

/**
 * Xử lý IPN từ VNPAY (server to server)
 * GET /api/payment/vnpay/ipn
 */
const vnpayIPN = async (req, res) => {
  try {
    const vnpParams = req.query;
    console.log('📥 VNPAY IPN Params:', vnpParams);

    const verifyResult = vnpayService.verifyIpnUrl(vnpParams);

    if (!verifyResult.isValid) {
      return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }

    const orderId = vnpParams.vnp_TxnRef;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    const amount = vnpParams.vnp_Amount / 100;
    if (amount !== order.totalPrice) {
      return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    if (vnpParams.vnp_ResponseCode === '00') {
      order.paymentStatus = 'paid';
      order.paymentMethod = 'VNPAY';
      order.vnpayData = {
        transactionNo: vnpParams.vnp_TransactionNo,
        bankCode: vnpParams.vnp_BankCode,
        payDate: vnpParams.vnp_PayDate,
        responseCode: vnpParams.vnp_ResponseCode,
        transactionStatus: 'success'
      };
      await order.save();
      return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    } else {
      order.paymentStatus = 'failed';
      order.vnpayData = {
        responseCode: vnpParams.vnp_ResponseCode,
        transactionStatus: 'failed'
      };
      await order.save();
      return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    }

  } catch (error) {
    console.error('❌ Lỗi xử lý VNPAY IPN:', error);
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

module.exports = {
  createVNPayPayment,
  vnpayReturn,
  vnpayIPN
};