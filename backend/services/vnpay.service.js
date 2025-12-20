const crypto = require('crypto');
const moment = require('moment');

class VNPayService {
  constructor() {
    this.vnp_TmnCode = process.env.VNP_TMN_CODE;
    this.vnp_HashSecret = process.env.VNP_HASH_SECRET;
    this.vnp_Url = process.env.VNP_URL;
    this.vnp_ReturnUrl = process.env.VNP_RETURN_URL;

    console.log('🔐 VNPAY Config:');
    console.log('  - TmnCode:', this.vnp_TmnCode);
    console.log('  - HashSecret:', this.vnp_HashSecret ? this.vnp_HashSecret.substring(0, 4) + '***' : 'MISSING');
    console.log('  - URL:', this.vnp_Url);
    console.log('  - ReturnUrl:', this.vnp_ReturnUrl);
  }

  /**
   * Tạo URL thanh toán VNPAY
   */
  createPaymentUrl(orderData) {
    try {
      const { orderId, amount, orderInfo, ipAddr, bankCode } = orderData;

      const date = new Date();
      const createDate = moment(date).format('YYYYMMDDHHmmss');
      
      // Xử lý IP
      let clientIp = ipAddr || '127.0.0.1';
      if (clientIp === '::1' || clientIp === '::ffff:127.0.0.1') {
        clientIp = '127.0.0.1';
      }

      // Tạo params - KHÔNG encode ở bước này
      let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.vnp_TmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: 'other',
        vnp_Amount: Math.round(amount * 100),
        vnp_ReturnUrl: this.vnp_ReturnUrl,
        vnp_IpAddr: clientIp,
        vnp_CreateDate: createDate
      };

      if (bankCode) {
        vnp_Params.vnp_BankCode = bankCode;
      }

      // Sắp xếp params theo key alphabet (KHÔNG encode key)
      vnp_Params = this.sortObject(vnp_Params);

      // Tạo chuỗi signData - encode value
      const signData = Object.keys(vnp_Params)
        .map(key => `${key}=${encodeURIComponent(vnp_Params[key]).replace(/%20/g, '+')}`)
        .join('&');

      // Tạo chữ ký
      const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      // Tạo URL cuối cùng
      const paymentUrl = `${this.vnp_Url}?${signData}&vnp_SecureHash=${signed}`;

      console.log('-------------------------------------------');
      console.log('🚀 VNPAY Payment URL Created:');
      console.log('- Order ID:', orderId);
      console.log('- Amount:', amount, '-> VNPay Amount:', Math.round(amount * 100));
      console.log('- IP:', clientIp);
      console.log('- SignData:', signData);
      console.log('- Hash:', signed);
      console.log('-------------------------------------------');

      return paymentUrl;

    } catch (error) {
      console.error('❌ Lỗi tạo VNPAY URL:', error);
      throw new Error('Không thể tạo URL thanh toán VNPAY');
    }
  }

  /**
   * Xác thực callback từ VNPAY
   */
  verifyReturnUrl(vnpParams) {
    try {
      const secureHash = vnpParams.vnp_SecureHash;
      
      // Copy params và xóa hash fields
      let params = { ...vnpParams };
      delete params.vnp_SecureHash;
      delete params.vnp_SecureHashType;

      // Sắp xếp params
      params = this.sortObject(params);

      // Tạo signData giống như khi tạo URL
      const signData = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`)
        .join('&');

      // Tạo chữ ký để so sánh
      const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      console.log('-------------------------------------------');
      console.log('🔍 VNPAY Verify:');
      console.log('- Received Hash:', secureHash);
      console.log('- Calculated Hash:', signed);
      console.log('- Match:', secureHash === signed);
      console.log('-------------------------------------------');

      if (secureHash === signed) {
        const rspCode = params.vnp_ResponseCode;
        return {
          isValid: true,
          isSuccess: rspCode === '00',
          responseCode: rspCode,
          message: this.getResponseMessage(rspCode),
          orderId: params.vnp_TxnRef,
          amount: parseInt(params.vnp_Amount) / 100,
          bankCode: params.vnp_BankCode,
          transactionNo: params.vnp_TransactionNo,
          payDate: params.vnp_PayDate
        };
      } else {
        return {
          isValid: false,
          isSuccess: false,
          message: 'Chữ ký không hợp lệ'
        };
      }

    } catch (error) {
      console.error('❌ Lỗi verify VNPAY:', error);
      return {
        isValid: false,
        isSuccess: false,
        message: 'Lỗi xác thực thanh toán'
      };
    }
  }

  /**
   * Xác thực IPN từ VNPAY
   */
  verifyIpnUrl(vnpParams) {
    return this.verifyReturnUrl(vnpParams);
  }

  /**
   * Sắp xếp object theo key alphabet
   */
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  /**
   * Lấy message từ response code
   */
  getResponseMessage(code) {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Các lỗi khác'
    };
    return messages[code] || 'Lỗi không xác định';
  }
}

module.exports = new VNPayService();