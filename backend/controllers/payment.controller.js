const crypto = require('crypto');
const qs = require('qs');
const moment = require('moment');
const Order = require('../models/order.model');

// Cấu hình VNPAY
const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'LWXCNYOK',
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || 'QPGTQ7HWPCBXCCI5WKIBPJWXZK40LTVK',
  vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:5173/payment/vnpay-return',
};

// Tạo URL thanh toán VNPAY
const createPaymentUrl = async (req, res) => {
  try {
    const { orderId, amount, orderInfo, bankCode } = req.body;

    // Kiểm tra đơn hàng tồn tại
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }

    // Kiểm tra quyền sở hữu đơn hàng
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thanh toán đơn hàng này'
      });
    }

    // Tạo các tham số VNPAY
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    // Tạo transaction ID unique hơn bằng cách thêm random number
    const orderId_vnpay = moment(date).format('YYMMDDHHmmss') + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    // Lấy IP address (chuyển IPv6 sang IPv4 nếu cần)
    let ipAddr = req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress ||
                 req.ip ||
                 '127.0.0.1';
    
    console.log('🔍 IP gốc:', ipAddr);
    
    // Chuyển IPv6 localhost sang IPv4
    if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
      ipAddr = '127.0.0.1';
    }
    
    // Nếu là IPv6, lấy phần IPv4
    if (ipAddr.includes('::ffff:')) {
      ipAddr = ipAddr.split('::ffff:')[1];
    }
    
    console.log('✅ IP sau khi xử lý:', ipAddr);

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId_vnpay,
      vnp_OrderInfo: orderInfo || `Thanh toan don hang ${order.orderNumber}`,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100, // VNPAY yêu cầu số tiền * 100
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    console.log('📋 VNPAY Params:', {
      TmnCode: vnp_Params.vnp_TmnCode,
      Amount: vnp_Params.vnp_Amount,
      IpAddr: vnp_Params.vnp_IpAddr,
      ReturnUrl: vnp_Params.vnp_ReturnUrl
    });

    if (bankCode) {
      vnp_Params.vnp_BankCode = bankCode;
    }

    // Sắp xếp tham số theo thứ tự alphabet
    const sortedParams = {};
    Object.keys(vnp_Params).sort().forEach(key => {
      sortedParams[key] = vnp_Params[key];
    });

    // Tạo query string theo cách VNPAY yêu cầu
    // Không encode, không có dấu = ở cuối
    let signData = '';
    Object.keys(sortedParams).forEach((key, index) => {
      if (index === 0) {
        signData += `${key}=${sortedParams[key]}`;
      } else {
        signData += `&${key}=${sortedParams[key]}`;
      }
    });

    console.log('📝 Sign Data:', signData);
    console.log('🔑 Hash Secret:', vnpayConfig.vnp_HashSecret);
    
    // Tạo secure hash HMAC-SHA512
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(signData).digest('hex');
    
    console.log('✅ Secure Hash:', signed);
    
    sortedParams.vnp_SecureHash = signed;

    // Tạo URL thanh toán - URL encode các giá trị
    let paymentUrlParams = '';
    Object.keys(sortedParams).forEach((key, index) => {
      const value = encodeURIComponent(sortedParams[key]);
      if (index === 0) {
        paymentUrlParams += `${key}=${value}`;
      } else {
        paymentUrlParams += `&${key}=${value}`;
      }
    });
    const paymentUrl = vnpayConfig.vnp_Url + '?' + paymentUrlParams;
    console.log('🔗 Payment URL:', paymentUrl);

    // Lưu thông tin giao dịch vào đơn hàng
    order.vnpayTransactionId = orderId_vnpay;
    order.paymentStatus = 'pending';
    await order.save();

    res.json({
      success: true,
      data: {
        paymentUrl,
        transactionId: orderId_vnpay
      }
    });

  } catch (error) {
    console.error('Lỗi tạo URL thanh toán VNPAY:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo URL thanh toán'
    });
  }
};

// Xử lý kết quả trả về từ VNPAY
const vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa các tham số không cần thiết
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp tham số
    const sortedParams = {};
    Object.keys(vnp_Params).sort().forEach(key => {
      sortedParams[key] = vnp_Params[key];
    });

    // Tạo secure hash để verify
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Kiểm tra chữ ký
    if (secureHash !== signed) {
      return res.status(400).json({
        success: false,
        message: 'Chữ ký không hợp lệ'
      });
    }

    // Tìm đơn hàng theo transaction ID
    const order = await Order.findOne({ 
      vnpayTransactionId: vnp_Params.vnp_TxnRef 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Xử lý kết quả thanh toán
    if (vnp_Params.vnp_ResponseCode === '00') {
      // Thanh toán thành công
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.addStatusHistory('confirmed', null, 'Thanh toán VNPAY thành công');
      
      // Cập nhật số lượng đã bán cho sản phẩm
      const Product = require('../models/product.model');
      for (let item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { 
            $inc: { 
              sold: item.quantity,
              stockQuantity: -item.quantity
            }
          }
        );
      }
      
      await order.save();

      res.json({
        success: true,
        message: 'Thanh toán thành công',
        data: {
          orderNumber: order.orderNumber,
          amount: vnp_Params.vnp_Amount / 100,
          transactionId: vnp_Params.vnp_TxnRef
        }
      });
    } else {
      // Thanh toán thất bại
      order.paymentStatus = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Thanh toán thất bại',
        data: {
          responseCode: vnp_Params.vnp_ResponseCode,
          orderNumber: order.orderNumber
        }
      });
    }

  } catch (error) {
    console.error('Lỗi xử lý kết quả VNPAY:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xử lý kết quả thanh toán'
    });
  }
};

// IPN (Instant Payment Notification) từ VNPAY
const vnpayIPN = async (req, res) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    const rspCode = vnp_Params['vnp_ResponseCode'];

    // Xóa các tham số không cần thiết
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp tham số
    const sortedParams = {};
    Object.keys(vnp_Params).sort().forEach(key => {
      sortedParams[key] = vnp_Params[key];
    });

    // Tạo secure hash để verify
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    let checkOrderId = true; // Kiểm tra orderId có hợp lệ không
    let checkAmount = true; // Kiểm tra amount có đúng không

    if (secureHash !== signed) {
      res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
      return;
    }

    // Tìm đơn hàng
    const order = await Order.findOne({ 
      vnpayTransactionId: vnp_Params.vnp_TxnRef 
    });

    if (!order) {
      checkOrderId = false;
    } else {
      if (order.totalAmount !== (vnp_Params.vnp_Amount / 100)) {
        checkAmount = false;
      }
    }

    if (!checkOrderId) {
      res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    } else if (!checkAmount) {
      res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
    } else if (order.paymentStatus === 'paid') {
      res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
    } else {
      if (rspCode === '00') {
        // Thanh toán thành công
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        await order.save();
        res.status(200).json({ RspCode: '00', Message: 'Success' });
      } else {
        // Thanh toán thất bại
        order.paymentStatus = 'failed';
        await order.save();
        res.status(200).json({ RspCode: '00', Message: 'Success' });
      }
    }

  } catch (error) {
    console.error('Lỗi xử lý IPN VNPAY:', error);
    res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

// Lấy danh sách ngân hàng hỗ trợ VNPAY
const getBankList = (req, res) => {
  const bankList = [
    { code: 'VNPAYQR', name: 'Thanh toán qua QR Code' },
    { code: 'VNBANK', name: 'Thanh toán qua thẻ ATM/Tài khoản nội địa' },
    { code: 'INTCARD', name: 'Thanh toán qua thẻ quốc tế' },
    { code: 'VIETCOMBANK', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam' },
    { code: 'VIETINBANK', name: 'Ngân hàng TMCP Công Thương Việt Nam' },
    { code: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
    { code: 'AGRIBANK', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam' },
    { code: 'TECHCOMBANK', name: 'Ngân hàng TMCP Kỹ Thương Việt Nam' },
    { code: 'ACB', name: 'Ngân hàng TMCP Á Châu' },
    { code: 'MB', name: 'Ngân hàng TMCP Quân đội' },
    { code: 'SACOMBANK', name: 'Ngân hàng TMCP Sài Gòn Thương Tín' },
    { code: 'EXIMBANK', name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam' },
    { code: 'MSBANK', name: 'Ngân hàng TMCP Hàng Hải' },
    { code: 'NAMABANK', name: 'Ngân hàng TMCP Nam Á' },
    { code: 'VNMART', name: 'Ví điện tử VnMart' },
    { code: 'VIETCAPITALBANK', name: 'Ngân hàng TMCP Bản Việt' },
    { code: 'SCB', name: 'Ngân hàng TMCP Sài Gòn' },
    { code: 'HDBANK', name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh' },
    { code: 'DONGABANK', name: 'Ngân hàng TMCP Đông Á' },
    { code: 'TPBANK', name: 'Ngân hàng TMCP Tiên Phong' },
    { code: 'OJB', name: 'Ngân hàng TMCP Đại Dương' },
    { code: 'SEABANK', name: 'Ngân hàng TMCP Đông Nam Á' },
    { code: 'UPI', name: 'Liên minh thanh toán quốc tế' },
    { code: 'SSBANK', name: 'Ngân hàng TMCP Đông Nam Á' }
  ];

  res.json({
    success: true,
    data: bankList
  });
};

module.exports = {
  createPaymentUrl,
  vnpayReturn,
  vnpayIPN,
  getBankList
};