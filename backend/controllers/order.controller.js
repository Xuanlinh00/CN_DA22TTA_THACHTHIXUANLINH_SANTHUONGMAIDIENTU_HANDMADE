const Order = require('../models/order.model');
const Shop = require('../models/shop.model');

// Khách hàng tạo đơn hàng
const createOrder = async (req, res) => {
  try {
    const order = new Order({
      customer: req.user._id, // lấy từ middleware protect
      orderItems: req.body.orderItems,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      totalPrice: req.body.totalPrice,
    });

    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Khách hàng xem đơn hàng của mình
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('orderItems.product', 'name price')
      .populate('customer', 'name email');

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin xem tất cả đơn hàng
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('orderItems.product', 'name price')
      .populate('customer', 'name email');

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin hoặc Vendor cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending_payment', 'processing', 'shipped', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ' });
    }

    const order = await Order.findById(req.params.id).populate('orderItems.product');
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Nếu là Vendor thì chỉ được cập nhật đơn hàng thuộc shop của mình
    if (req.user.role === 'vendor') {
      const vendorShop = await Shop.findOne({ user: req.user._id });
      if (!vendorShop) {
        return res.status(403).json({ message: 'Bạn chưa có cửa hàng' });
      }

      const vendorShopIds = order.orderItems.map(item => item.shop.toString());
      if (!vendorShopIds.includes(vendorShop._id.toString())) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật đơn hàng này' });
      }
    }

    order.orderStatus = status;
    if (status === 'completed') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.status(200).json({
      message: 'Cập nhật trạng thái đơn hàng thành công',
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: 'Không thể cập nhật trạng thái đơn hàng: ' + error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
