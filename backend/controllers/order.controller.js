const Order = require('../models/order.model');
const Shop = require('../models/shop.model');
const Product = require('../models/product.model');
const ghnService = require('../services/ghn.service'); // Import service GHN

// 1. Khách hàng tạo đơn hàng
const createOrder = async (req, res) => {
  try {
    const { 
      items,
      shippingAddress, 
      paymentMethod, 
      shippingMethod,
      shippingFee = 30000
    } = req.body;

    console.log('📦 Tạo đơn hàng - Items nhận được:', items);
    console.log('📦 Số lượng items:', items?.length);

    // Kiểm tra có items không
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có sản phẩm nào trong đơn hàng' });
    }

    // Lấy thông tin chi tiết sản phẩm từ database
    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).populate('shop');

    // Tạo map để dễ tra cứu
    const productMap = {};
    products.forEach(p => {
      productMap[p._id.toString()] = p;
    });

    // --- BƯỚC 1: KIỂM TRA TỒN KHO & TẠO ORDER ITEMS ---
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap[item.product];
      
      if (!product) {
        return res.status(400).json({ success: false, message: `Không tìm thấy sản phẩm` });
      }

      if (!product.isActive) {
        return res.status(400).json({ success: false, message: `Sản phẩm "${product.name}" đã ngừng bán` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Sản phẩm "${product.name}" không đủ hàng. Tồn kho: ${product.stockQuantity}` 
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        shop: product.shop._id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/150',
        price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    const totalAmount = subtotal + shippingFee;

    // --- BƯỚC 2: TẠO ĐỐI TƯỢNG ORDER ---
    // Tạo orderNumber trước
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `HD${timestamp}${random}`;
    
    const order = new Order({
      user: req.user._id,
      orderNumber,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName || req.user.name,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        ward: shippingAddress.ward,
        district: shippingAddress.district,
        city: shippingAddress.city,
        note: shippingAddress.note || ''
      },
      shippingMethod: {
        name: shippingMethod === 'express' ? 'Giao hàng nhanh' : 'Giao hàng tiêu chuẩn',
        provider: 'GHN',
        fee: shippingFee,
        estimatedDays: shippingMethod === 'express' ? 2 : 5
      },
      paymentMethod: paymentMethod === 'vnpay' ? 'VNPAY' : 'COD',
      paymentStatus: 'pending',
      subtotal,
      shippingFee,
      totalAmount,
      status: 'pending'
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
          update: { $inc: { stockQuantity: -item.quantity, sold: +item.quantity } },
        },
      };
    });
    await Product.bulkWrite(bulkOption);

    // Xóa giỏ hàng trong database (nếu có)
    const Cart = require('../models/cart.model');
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], totalAmount: 0, totalItems: 0 }
    );

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
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price images') // Populate ảnh để hiện thumbnail
      .populate('items.shop', 'shopName')
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2.5. Shop owner xem đơn hàng của shop
const getShopOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ user: req.user._id });
    if (!shop) {
      return res.status(403).json({ success: false, message: 'Bạn chưa có gian hàng' });
    }

    const orders = await Order.find({ 'items.shop': shop._id })
      .populate('user', 'name email phone')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

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
      filter = { 'items.shop': shop._id };
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price')
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
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'];
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
      const isOwner = order.items.some(item => item.shop.toString() === shop._id.toString());
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Đơn hàng này không thuộc quản lý của bạn' });
      }
    }

    order.status = status;

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
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền huỷ đơn này' });
        }

        // Chỉ huỷ được khi đang xử lý hoặc chờ thanh toán
        if (order.status !== 'pending' && order.status !== 'confirmed') {
            return res.status(400).json({ success: false, message: 'Đơn hàng đang giao, không thể huỷ' });
        }

        order.status = 'cancelled';
        await order.save();

        // HOÀN LẠI TỒN KHO (QUAN TRỌNG)
        const bulkOption = order.items.map((item) => {
            return {
              updateOne: {
                filter: { _id: item.product },
                update: { $inc: { stockQuantity: +item.quantity, sold: -item.quantity } },
              },
            };
        });
        await Product.bulkWrite(bulkOption);

        res.json({ success: true, message: 'Đã huỷ đơn hàng thành công' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 6. Lấy chi tiết đơn hàng theo ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images')
      .populate('items.shop', 'shopName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra quyền xem đơn hàng
    // Admin: xem tất cả
    // Shop owner: chỉ xem đơn có sản phẩm của shop mình
    // User: chỉ xem đơn của mình
    if (req.user.role === 'admin') {
      // Admin xem được tất cả
      return res.status(200).json({ success: true, data: order });
    } else if (req.user.role === 'shop_owner') {
      // Shop owner kiểm tra xem đơn có sản phẩm của shop không
      const shop = await Shop.findOne({ user: req.user._id });
      if (shop) {
        const hasShopProduct = order.items.some(
          item => item.shop._id.toString() === shop._id.toString()
        );
        if (hasShopProduct) {
          return res.status(200).json({ success: true, data: order });
        }
      }
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn hàng này' });
    } else {
      // User chỉ xem đơn của mình
      if (order.user._id.toString() === req.user._id.toString()) {
        return res.status(200).json({ success: true, data: order });
      }
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn hàng này' });
    }
  } catch (error) {
    console.error('Lỗi lấy chi tiết đơn hàng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getShopOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderById
};