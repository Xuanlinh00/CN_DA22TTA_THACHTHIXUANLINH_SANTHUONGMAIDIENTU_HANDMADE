const Order = require('../models/order.model');
const Shop = require('../models/shop.model');

// @desc    Admin hoặc Vendor cập nhật trạng thái đơn hàng
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin hoặc Vendor)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Kiểm tra trạng thái hợp lệ
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

module.exports = { updateOrderStatus };
