// services/ghn.service.js
const axios = require('axios');

// Cấu hình từ biến môi trường (.env)
const GHN_API_TOKEN = process.env.GHN_API_TOKEN; // Token lấy từ GHN
const GHN_SHOP_ID = process.env.GHN_SHOP_ID;     // ShopID lấy từ GHN

// Kiểm tra cấu hình GHN
if (!GHN_API_TOKEN || GHN_API_TOKEN === 'your_ghn_token_here') {
  console.warn('⚠️  GHN_API_TOKEN chưa được cấu hình trong .env');
}
if (!GHN_SHOP_ID || GHN_SHOP_ID === 'your_ghn_shop_id_here') {
  console.warn('⚠️  GHN_SHOP_ID chưa được cấu hình trong .env');
}
const GHN_API_URL = 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create'; // Dùng link Dev để test

// Tính phí giao hàng
const calculateShippingFee = async (shippingData) => {
  try {
    // Kiểm tra cấu hình trước khi gọi API
    if (!GHN_API_TOKEN || GHN_API_TOKEN === 'your_ghn_token_here' || 
        !GHN_SHOP_ID || GHN_SHOP_ID === 'your_ghn_shop_id_here') {
      console.warn('⚠️  GHN chưa được cấu hình, sử dụng phí mặc định');
      return {
        total: 30000, // Phí mặc định
        service_fee: 30000,
        insurance_fee: 0,
        pick_station_fee: 0,
        coupon_value: 0,
        r2s_fee: 0
      };
    }

    const payload = {
      service_type_id: 2, // 2: Chuẩn
      from_district_id: 1442, // Quận 1, TP.HCM (shop mặc định)
      from_ward_code: "21211", // Phường Bến Nghé
      to_district_id: shippingData.districtId,
      to_ward_code: shippingData.wardCode,
      height: 10,
      length: 20,
      weight: shippingData.weight || 500, // gram
      width: 10,
      insurance_value: shippingData.orderValue || 0,
      coupon: null
    };

    const response = await axios.post(
      'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Token': GHN_API_TOKEN,
          'ShopId': GHN_SHOP_ID
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("Lỗi tính phí GHN:", error.response?.data || error.message);
    // Trả về phí mặc định nếu lỗi
    return {
      total: 30000,
      service_fee: 30000,
      insurance_fee: 0,
      pick_station_fee: 0,
      coupon_value: 0,
      r2s_fee: 0
    };
  }
};

const createShippingOrder = async (orderData) => {
  try {
    // Kiểm tra cấu hình trước khi gọi API
    if (!GHN_API_TOKEN || GHN_API_TOKEN === 'your_ghn_token_here' || 
        !GHN_SHOP_ID || GHN_SHOP_ID === 'your_ghn_shop_id_here') {
      console.warn('⚠️  GHN chưa được cấu hình, bỏ qua tạo vận đơn');
      return null; // Trả về null thay vì throw error
    }
    // Mapping dữ liệu từ đơn hàng của bạn sang format của GHN
    const payload = {
      shop_id: parseInt(GHN_SHOP_ID),
      payment_type_id: 1, // 1: Người bán trả phí, 2: Người mua trả phí
      note: "Cho xem hàng, không cho thử",
      required_note: "KHONGCHOXEMHANG",
      
      // Thông tin người nhận (Frontend cần gửi đủ các field này)
      to_name: orderData.shippingAddress.fullName,
      to_phone: orderData.shippingAddress.phone,
      to_address: orderData.shippingAddress.address, // Địa chỉ chi tiết (số nhà, đường)
      to_ward_code: orderData.shippingAddress.wardCode, // Mã phường/xã (bắt buộc)
      to_district_id: orderData.shippingAddress.districtId, // ID quận/huyện (bắt buộc)
      
      // Thông tin thu hộ (COD)
      cod_amount: orderData.paymentMethod === 'COD' ? orderData.totalPrice : 0,

      // Thông tin gói hàng (Giả định mặc định nếu không có dữ liệu thực)
      weight: 200, // gram
      length: 10,
      width: 10,
      height: 10,
      
      service_type_id: 2, // 2: Chuẩn, có thể gọi API get service để lấy ID động
      
      // Danh sách sản phẩm
      items: orderData.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        weight: 200 // Set tạm, nên lấy từ Product Model
      }))
    };

    const response = await axios.post(GHN_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Token': GHN_API_TOKEN,
        'ShopId': GHN_SHOP_ID
      }
    });

    return response.data.data; // Trả về dữ liệu từ GHN (bao gồm order_code)
  } catch (error) {
    // Log lỗi chi tiết để debug
    console.error("Lỗi GHN:", error.response?.data || error.message);
    throw new Error('Lỗi tạo đơn giao hàng phía đối tác vận chuyển');
  }
};

module.exports = { createShippingOrder, calculateShippingFee };