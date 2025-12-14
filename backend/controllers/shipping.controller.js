const axios = require('axios');

// Cấu hình API giao hàng (GHN - Giao Hàng Nhanh)
const ghnConfig = {
  apiUrl: process.env.GHN_API_URL || 'https://dev-online-gateway.ghn.vn/shiip/public-api',
  token: process.env.GHN_TOKEN,
  shopId: process.env.GHN_SHOP_ID
};

// Tạo instance axios cho GHN API
const ghnAPI = axios.create({
  baseURL: ghnConfig.apiUrl,
  headers: {
    'Token': ghnConfig.token,
    'ShopId': ghnConfig.shopId,
    'Content-Type': 'application/json'
  }
});

// Lấy danh sách tỉnh/thành phố
const getProvinces = async (req, res) => {
  try {
    const response = await ghnAPI.get('/master-data/province');
    
    res.json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách tỉnh:', error);
    
    // Fallback data nếu API không hoạt động
    const fallbackProvinces = [
      { ProvinceID: 202, ProvinceName: "Hồ Chí Minh" },
      { ProvinceID: 201, ProvinceName: "Hà Nội" },
      { ProvinceID: 203, ProvinceName: "Đà Nẵng" },
      { ProvinceID: 204, ProvinceName: "Cần Thơ" },
      { ProvinceID: 205, ProvinceName: "Hải Phòng" }
    ];
    
    res.json({
      success: true,
      data: fallbackProvinces,
      fallback: true
    });
  }
};

// Lấy danh sách quận/huyện theo tỉnh
const getDistricts = async (req, res) => {
  try {
    const { provinceId } = req.params;
    
    const response = await ghnAPI.get('/master-data/district', {
      params: { province_id: provinceId }
    });
    
    res.json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách quận/huyện:', error);
    
    // Fallback data
    const fallbackDistricts = [
      { DistrictID: 1442, DistrictName: "Quận 1" },
      { DistrictID: 1443, DistrictName: "Quận 2" },
      { DistrictID: 1444, DistrictName: "Quận 3" },
      { DistrictID: 1445, DistrictName: "Quận 4" },
      { DistrictID: 1446, DistrictName: "Quận 5" }
    ];
    
    res.json({
      success: true,
      data: fallbackDistricts,
      fallback: true
    });
  }
};

// Lấy danh sách phường/xã theo quận/huyện
const getWards = async (req, res) => {
  try {
    const { districtId } = req.params;
    
    const response = await ghnAPI.get('/master-data/ward', {
      params: { district_id: districtId }
    });
    
    res.json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách phường/xã:', error);
    
    // Fallback data
    const fallbackWards = [
      { WardCode: "21211", WardName: "Phường Bến Nghé" },
      { WardCode: "21212", WardName: "Phường Bến Thành" },
      { WardCode: "21213", WardName: "Phường Cầu Kho" },
      { WardCode: "21214", WardName: "Phường Cầu Ông Lãnh" },
      { WardCode: "21215", WardName: "Phường Cô Giang" }
    ];
    
    res.json({
      success: true,
      data: fallbackWards,
      fallback: true
    });
  }
};

// Tính phí vận chuyển
const calculateShippingFee = async (req, res) => {
  try {
    const {
      from_district_id,
      from_ward_code,
      to_district_id,
      to_ward_code,
      weight,
      length,
      width,
      height,
      service_type_id = 2 // 1: Express, 2: Standard
    } = req.body;

    const requestData = {
      from_district_id: parseInt(from_district_id),
      from_ward_code: from_ward_code.toString(),
      to_district_id: parseInt(to_district_id),
      to_ward_code: to_ward_code.toString(),
      weight: parseInt(weight) || 500, // gram
      length: parseInt(length) || 20, // cm
      width: parseInt(width) || 15, // cm
      height: parseInt(height) || 10, // cm
      service_type_id: parseInt(service_type_id)
    };

    const response = await ghnAPI.post('/v2/shipping-order/fee', requestData);
    
    const feeData = response.data.data;
    
    res.json({
      success: true,
      data: {
        service_fee: feeData.service_fee,
        insurance_fee: feeData.insurance_fee,
        pick_station_fee: feeData.pick_station_fee,
        coupon_value: feeData.coupon_value,
        r2s_fee: feeData.r2s_fee,
        total: feeData.total,
        service_type_id: service_type_id
      }
    });
  } catch (error) {
    console.error('Lỗi tính phí vận chuyển:', error);
    
    // Fallback tính phí cơ bản
    const { weight = 500, service_type_id = 2 } = req.body;
    let baseFee = 25000; // Phí cơ bản 25k
    
    // Tính theo trọng lượng
    if (weight > 500) {
      baseFee += Math.ceil((weight - 500) / 500) * 5000;
    }
    
    // Phí express cao hơn 50%
    if (service_type_id === 1) {
      baseFee = Math.round(baseFee * 1.5);
    }
    
    res.json({
      success: true,
      data: {
        service_fee: baseFee,
        insurance_fee: 0,
        pick_station_fee: 0,
        coupon_value: 0,
        r2s_fee: 0,
        total: baseFee,
        service_type_id: service_type_id
      },
      fallback: true
    });
  }
};

// Lấy thời gian giao hàng dự kiến
const getDeliveryTime = async (req, res) => {
  try {
    const {
      from_district_id,
      from_ward_code,
      to_district_id,
      to_ward_code,
      service_id
    } = req.body;

    const requestData = {
      from_district_id: parseInt(from_district_id),
      from_ward_code: from_ward_code.toString(),
      to_district_id: parseInt(to_district_id),
      to_ward_code: to_ward_code.toString(),
      service_id: parseInt(service_id)
    };

    const response = await ghnAPI.post('/v2/shipping-order/leadtime', requestData);
    
    res.json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Lỗi lấy thời gian giao hàng:', error);
    
    // Fallback thời gian giao hàng
    const { service_id = 2 } = req.body;
    const leadtime = service_id === 1 ? 
      new Date(Date.now() + 24 * 60 * 60 * 1000) : // Express: 1 ngày
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // Standard: 3 ngày
    
    res.json({
      success: true,
      data: {
        leadtime: Math.floor(leadtime.getTime() / 1000)
      },
      fallback: true
    });
  }
};

// Tạo đơn hàng vận chuyển
const createShippingOrder = async (req, res) => {
  try {
    const {
      to_name,
      to_phone,
      to_address,
      to_ward_code,
      to_district_id,
      cod_amount,
      content,
      weight,
      length,
      width,
      height,
      service_type_id = 2,
      payment_type_id = 1, // 1: Shop trả phí, 2: Người nhận trả phí
      required_note = "KHONGCHOXEMHANG" // CHOXEMHANGKHONGTHU, CHOTHUHANG, KHONGCHOXEMHANG
    } = req.body;

    const requestData = {
      payment_type_id: parseInt(payment_type_id),
      note: content || "Giao hàng sản phẩm handmade",
      required_note,
      from_name: "Craftify Handmade",
      from_phone: "0123456789",
      from_address: "123 Đường ABC, Phường XYZ",
      from_ward_name: "Phường 1",
      from_district_name: "Quận 1",
      from_province_name: "Hồ Chí Minh",
      to_name,
      to_phone,
      to_address,
      to_ward_code: to_ward_code.toString(),
      to_district_id: parseInt(to_district_id),
      cod_amount: parseInt(cod_amount) || 0,
      content: content || "Sản phẩm handmade",
      weight: parseInt(weight) || 500,
      length: parseInt(length) || 20,
      width: parseInt(width) || 15,
      height: parseInt(height) || 10,
      service_type_id: parseInt(service_type_id)
    };

    const response = await ghnAPI.post('/v2/shipping-order/create', requestData);
    
    res.json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Lỗi tạo đơn vận chuyển:', error);
    
    // Fallback tạo mã vận đơn giả
    const trackingCode = 'CF' + Date.now().toString().slice(-8);
    
    res.json({
      success: true,
      data: {
        order_code: trackingCode,
        sort_code: "HCM-" + trackingCode.slice(-4),
        trans_type: "truck",
        ward_encode: "",
        district_encode: "",
        fee: {
          main_service: 25000,
          insurance: 0,
          cod_fee: 0,
          station_do: 0,
          station_pu: 0,
          return: 0,
          r2s: 0,
          return_again: 0,
          coupon: 0,
          document_return: 0,
          double_check: 0,
          cod_failed_fee: 0,
          pick_remote_areas_fee: 0,
          deliver_remote_areas_fee: 0,
          pick_remote_areas_fee_return: 0,
          deliver_remote_areas_fee_return: 0,
          cod_pick_remote_areas_fee: 0,
          cod_deliver_remote_areas_fee: 0
        },
        total_fee: 25000,
        expected_delivery_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      fallback: true
    });
  }
};

// Theo dõi đơn hàng
const trackOrder = async (req, res) => {
  try {
    const { order_code } = req.params;
    
    const response = await ghnAPI.post('/v2/shipping-order/detail', {
      order_code
    });
    
    res.json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Lỗi theo dõi đơn hàng:', error);
    
    // Fallback trạng thái đơn hàng
    res.json({
      success: true,
      data: {
        order_code: req.params.order_code,
        status: "ready_to_pick",
        status_text: "Đang chuẩn bị lấy hàng",
        created_date: new Date().toISOString(),
        expected_delivery_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      fallback: true
    });
  }
};

// Lấy danh sách dịch vụ vận chuyển
const getServices = async (req, res) => {
  try {
    const { from_district, to_district } = req.query;
    
    const response = await ghnAPI.get('/v2/shipping-order/available-services', {
      params: {
        shop_id: ghnConfig.shopId,
        from_district: parseInt(from_district),
        to_district: parseInt(to_district)
      }
    });
    
    res.json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Lỗi lấy dịch vụ vận chuyển:', error);
    
    // Fallback services
    const services = [
      {
        service_id: 53320,
        short_name: "E",
        service_type_id: 1,
        config_fee_id: "",
        extra_cost_id: "",
        standard_config_fee_id: "",
        standard_extra_cost_id: ""
      },
      {
        service_id: 53321,
        short_name: "S",
        service_type_id: 2,
        config_fee_id: "",
        extra_cost_id: "",
        standard_config_fee_id: "",
        standard_extra_cost_id: ""
      }
    ];
    
    res.json({
      success: true,
      data: services,
      fallback: true
    });
  }
};

module.exports = {
  getProvinces,
  getDistricts,
  getWards,
  calculateShippingFee,
  getDeliveryTime,
  createShippingOrder,
  trackOrder,
  getServices
};