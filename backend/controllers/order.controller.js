const Order = require('../models/order.model');
const Shop = require('../models/shop.model');
const Product = require('../models/product.model');
const ghnService = require('../services/ghn.service'); // Import service GHN

// 1. Khách hàng tạo đơn hàng
const createOrder = async (req, res) => {
  try {
    const { 
      orderItems, 
      shippingAddress, 
      paymentMethod, 
      totalPrice, 
      shippingFee 
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có sản phẩm nào trong đơn hàng' });
    }

    // --- BƯỚC 1: KIỂM TRA TỒN KHO ---
    // Trước khi tạo đơn, phải chắc chắn tất cả sản phẩm đều còn hàng
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Sản phẩm ID ${item.product} không tồn tại` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Sản phẩm "${product.name}" không đủ hàng. Tồn kho: ${product.stock}` 
        });
      }
    }

    // --- BƯỚC 2: TẠO ĐỐI TƯỢNG ORDER ---
    const order = new Order({
      customer: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      shippingFee: shippingFee || 0,
      paymentStatus: 'pending', // Mặc định chưa thanh toán
      orderStatus: 'pending_payment'
    });

    // --- BƯỚC 3: GỌI GHN (TẠO VẬN ĐƠN) ---
    // Chỉ tạo vận đơn nếu thanh toán COD hoặc đã thanh toán online thành công (tuỳ logic)
    // Ở đây làm mẫu gọi luôn
    try {
      // Cấu trúc dữ liệu gửi sang service GHN
      const ghnData = {
        shippingAddress,
        paymentMethod,
        totalPrice,
        items: orderItems // Service GHN cần map lại tên SP
      };

      const shippingOrder = await ghnService.createShippingOrder(ghnData);
      
      if (shippingOrder) {
        order.shippingCode = shippingOrder.order_code; // Lưu mã vận đơn (VD: L8CC2...)
        order.expectedDeliveryTime = shippingOrder.expected_delivery_time;
      }
    } catch (ghnError) {
      console.error('Lỗi GHN:', ghnError.message);
      // Có thể return lỗi luôn hoặc cho phép tạo đơn nhưng shippingCode rỗng (Admin xử lý sau)
      // Ở đây tôi chọn cách warning nhưng vẫn cho tạo đơn
    }

    // --- BƯỚC 4: LƯU ĐƠN & TRỪ TỒN KHO ---
    const createdOrder = await order.save();

    // Trừ tồn kho (Bulk Write để tối ưu hiệu năng)
    const bulkOption = orderItems.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: -item.quantity, sold: +item.quantity } },
        },
      };
    });
    await Product.bulkWrite(bulkOption);

    res.status(201).json({ 
      success: true, 
      message: 'Đặt hàng thành công', 
      data: createdOrder 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi tạo đơn hàng: ' + error.message });
  }
};

// 2. Khách hàng xem lịch sử đơn hàng
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('orderItems.product', 'name price images') // Populate ảnh để hiện thumbnail
      .populate('orderItems.shop', 'shopName')
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Admin hoặc Vendor xem đơn hàng
// - Admin: Xem tất cả
// - Vendor: Chỉ xem đơn hàng có chứa sản phẩm của Shop mình
const getAllOrders = async (req, res) => {
  try {
    let filter = {};

    // Nếu là Vendor, cần tìm Shop ID của user này trước
    if (req.user.role === 'vendor') {
      const shop = await Shop.findOne({ user: req.user._id });
      if (!shop) {
        return res.status(403).json({ success: false, message: 'Bạn chưa có cửa hàng' });
      }
      // Lọc các đơn hàng mà trong items có shop là shop của user này
      filter = { 'orderItems.shop': shop._id };
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('orderItems.product', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Admin hoặc Vendor cập nhật trạng thái
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    // Validate trạng thái hợp lệ
    const validStatuses = ['pending_payment', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // --- CHECK QUYỀN VENDOR ---
    if (req.user.role === 'vendor') {
      const shop = await Shop.findOne({ user: req.user._id });
      if (!shop) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền (Chưa có shop)' });
      }

      // Kiểm tra xem đơn hàng này có món nào thuộc shop này không
      // Lưu ý: Đồ án nhiều chủ thì 1 đơn có thể có nhiều shop. 
      // Logic đơn giản: Nếu đơn có hàng của shop -> shop được update status (hoặc chia nhỏ đơn - sub order)
      // Ở đây ta dùng logic: Shop chỉ được update nếu đơn đó CHỈ chứa hàng của shop hoặc hệ thống cho phép.
      const isOwner = order.orderItems.some(item => item.shop.toString() === shop._id.toString());
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Đơn hàng này không thuộc quản lý của bạn' });
      }
    }

    order.orderStatus = status;

    // Cập nhật timestamp
    if (status === 'shipped') {
        // Có thể gọi API GHN để update trạng thái ship nếu cần
    }
    if (status === 'completed') {
      order.paymentStatus = 'paid'; // Giả định giao xong là đã thu tiền
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái thành ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Khách hàng huỷ đơn (Khi đơn chưa giao)
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
        }

        // Chỉ chủ đơn hàng mới được huỷ
        if (order.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền huỷ đơn này' });
        }

        // Chỉ huỷ được khi đang xử lý hoặc chờ thanh toán
        if (order.orderStatus !== 'pending_payment' && order.orderStatus !== 'processing') {
            return res.status(400).json({ success: false, message: 'Đơn hàng đang giao, không thể huỷ' });
        }

        order.orderStatus = 'cancelled';
        await order.save();

        // HOÀN LẠI TỒN KHO (QUAN TRỌNG)
        const bulkOption = order.orderItems.map((item) => {
            return {
              updateOne: {
                filter: { _id: item.product },
                update: { $inc: { stock: +item.quantity, sold: -item.quantity } },
              },
            };
        });
        await Product.bulkWrite(bulkOption);

        res.json({ success: true, message: 'Đã huỷ đơn hàng thành công' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
};