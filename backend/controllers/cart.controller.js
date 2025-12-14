const mongoose = require('mongoose');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// Helper function: Tính lại tổng giỏ hàng
const recalculateCartTotal = (cart) => {
  cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
};

// 1. Lấy giỏ hàng của user
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images stockQuantity shop isActive',
        populate: {
          path: 'shop',
          select: 'shopName status'
        }
      });

    if (!cart) {
      return res.json({
        success: true,
        data: { items: [], totalAmount: 0, totalItems: 0 }
      });
    }

    // Kiểm tra và cập nhật giá sản phẩm (nếu có thay đổi)
    let hasChanges = false;
    for (let item of cart.items) {
      if (item.product && item.price !== item.product.price) {
        item.price = item.product.price;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await cart.save();
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Thêm sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Kiểm tra sản phẩm tồn tại và đang hoạt động
    const product = await Product.findById(productId).populate('shop');
    if (!product || !product.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sản phẩm không tồn tại hoặc đã ngừng bán' 
      });
    }

    // Kiểm tra shop còn hoạt động
    if (product.shop.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Gian hàng này hiện không hoạt động'
      });
    }

    // Kiểm tra tồn kho
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Chỉ còn ${product.stockQuantity} sản phẩm trong kho` 
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Tạo giỏ hàng mới
      cart = new Cart({
        user: req.user._id,
        items: [{
          product: productId,
          quantity,
          price: product.price
        }]
      });
    } else {
      // Kiểm tra sản phẩm đã có trong giỏ chưa
      const existingItem = cart.items.find(item => 
        item.product.toString() === productId
      );

      if (existingItem) {
        // Cập nhật số lượng
        const newQuantity = existingItem.quantity + quantity;
        if (product.stockQuantity < newQuantity) {
          return res.status(400).json({ 
            success: false, 
            message: `Chỉ còn ${product.stockQuantity} sản phẩm trong kho` 
          });
        }
        existingItem.quantity = newQuantity;
        existingItem.price = product.price; // Cập nhật giá mới nhất
      } else {
        // Thêm sản phẩm mới
        cart.items.push({
          product: productId,
          quantity,
          price: product.price
        });
      }
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name price images stockQuantity shop',
      populate: {
        path: 'shop',
        select: 'shopName'
      }
    });

    res.json({
      success: true,
      message: 'Đã thêm vào giỏ hàng',
      data: cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. [MỚI] Cập nhật số lượng sản phẩm (Dùng cho nút tăng/giảm ở trang Cart)
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // VALIDATION
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
    }
    // Nếu số lượng gửi lên <= 0, gợi ý dùng API xoá
    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Số lượng không hợp lệ. Hãy dùng chức năng xoá nếu muốn bỏ sản phẩm.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không có trong giỏ hàng' });
    }

    // Tìm sản phẩm gốc để check tồn kho thực tế
    const product = await Product.findById(productId);
    if (!product) {
        // Trường hợp hiếm: SP trong giỏ nhưng đã bị xóa khỏi database Shop
        // Ta xoá luôn khỏi giỏ
        cart.items.splice(itemIndex, 1);
        recalculateCartTotal(cart);
        await cart.save();
        return res.status(404).json({ success: false, message: 'Sản phẩm này hiện không còn kinh doanh.' });
    }

    // CHECK TỒN KHO
    if (product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Rất tiếc, kho chỉ còn ${product.stock} sản phẩm.` 
      });
    }

    // Cập nhật
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal = quantity * product.price; // Lấy giá hiện tại của SP (nếu muốn giữ giá cũ lúc add, sửa thành cart.items[itemIndex].price)

    recalculateCartTotal(cart);
    await cart.save();

    // Trả về kết quả
    await cart.populate('items.product', 'name price images');
    await cart.populate('items.shop', 'shopName');

    res.json({ success: true, message: 'Cập nhật giỏ hàng thành công', data: cart });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 4. Xoá sản phẩm khỏi giỏ
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại' });
    }

    // Lọc bỏ sản phẩm
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    if (cart.items.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Sản phẩm không tìm thấy trong giỏ' });
    }

    recalculateCartTotal(cart);
    await cart.save();

    await cart.populate('items.product', 'name price images');
    await cart.populate('items.shop', 'shopName');

    res.json({ success: true, message: 'Đã xoá sản phẩm', data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart 
};