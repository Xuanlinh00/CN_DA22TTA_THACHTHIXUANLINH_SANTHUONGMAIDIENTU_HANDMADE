const moment = require('moment'); // npm install moment
const querystring = require('qs');
const crypto = require('crypto');
const Order = require('../models/order.model');

// Cấu hình VNPAY (Nên đưa vào biến môi trường .env)
const tmnCode = process.env.VNP_TMN_CODE || 'YOUR_TMN_CODE';
const secretKey = process.env.VNP_HASH_SECRET || 'YOUR_HASH_SECRET';
const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5000/api/payment/vnpay-return';

// 1. Tạo URL thanh toán
const createPaymentUrl = async (req, res) => {
  try {
    const { amount, orderId, bankCode, language } = req.body;
    
    // Kiểm tra đơn hàng có tồn tại không
    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    }

    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    // Lấy IP của user
    const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    // Cấu hình tham số gửi sang VNPAY
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = language || 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId; // Mã đơn hàng (Dùng luôn ID mongoDB hoặc mã riêng)
    vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang ${orderId}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100; // VNPAY tính đơn vị là đồng (nhân 100)
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    // Sắp xếp tham số theo Alphabet (Bắt buộc để tạo checksum đúng)
    vnp_Params = sortObject(vnp_Params);

    // Tạo chữ ký bảo mật
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex');
    
    vnp_Params['vnp_SecureHash'] = signed;

    // Tạo URL cuối cùng
    const paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });

    res.status(200).json({ success: true, paymentUrl });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo thanh toán: ' + error.message });
  }
};

// 2. Xử lý kết quả trả về từ VNPAY (Return URL)
// API này sẽ được trình duyệt gọi sau khi thanh toán xong
const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa các param hash để tính toán lại hash
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp lại
    vnp_Params = sortObject(vnp_Params);

    // Tính toán lại hash để xác thực
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex');

    // URL Frontend để redirect về (Ví dụ: http://localhost:3000/order-result)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    if (secureHash === signed) {
      // Check mã phản hồi: 00 là thành công
      const orderId = vnp_Params['vnp_TxnRef'];
      const rspCode = vnp_Params['vnp_ResponseCode'];

      if (rspCode === '00') {
        // --- CẬP NHẬT DB ---
        const order = await Order.findById(orderId);
        if (order) {
            order.paymentStatus = 'paid';
            order.paymentMethod = 'VNPAY';
            // order.paidAt = Date.now(); // Nếu có trường này
            await order.save();
        }
        // Chuyển hướng về trang "Thành công" của Frontend
        return res.redirect(`${clientUrl}/payment/success?orderId=${orderId}`);
      } else {
        // Thanh toán thất bại
        return res.redirect(`${clientUrl}/payment/failed?orderId=${orderId}`);
      }
    } else {
      return res.status(200).json({ code: '97', message: 'Checksum failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xử lý VNPAY: ' + error.message });
  }
};

// Hàm phụ trợ sắp xếp tham số (Bắt buộc theo tài liệu VNPAY)
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = obj[str[key]];
  }
  return sorted;
}

module.exports = {
  createPaymentUrl,
  vnpayReturn
};