const mongoose = require('mongoose');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// --- HELPER: Hàm tính lại tổng tiền giỏ hàng ---
// Mục đích: Đảm bảo totalPrice luôn khớp với tổng các subtotal
const recalculateCartTotal = (cart) => {
  cart.totalPrice = cart.items.reduce((total, item) => total + item.subtotal, 0);
  return cart;
};

// 1. Lấy giỏ hàng
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id })
      .populate('items.product', 'name price images stock')
      .populate('items.shop', 'shopName');

    if (!cart) {
      return res.json({ success: true, data: { items: [], totalPrice: 0 } });
    }

    res.json({ success: true, data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. Thêm sản phẩm vào giỏ (Có check tồn kho)
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // VALIDATION INPUT
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
    }
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Số lượng phải lớn hơn 0' });
    }

    // Tìm sản phẩm để check tồn kho và lấy giá
    const product = await Product.findById(productId).populate('shop');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      cart = new Cart({ customer: req.user._id, items: [], totalPrice: 0 });
    }

    // Kiểm tra sản phẩm trong giỏ
    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (existingItemIndex > -1) {
      // Nếu đã có -> Cộng dồn số lượng
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      // Check tồn kho
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Kho chỉ còn ${product.stock} sản phẩm. Giỏ của bạn đang có ${cart.items[existingItemIndex].quantity}.` 
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].subtotal = newQuantity * product.price;
    } else {
      // Nếu chưa có -> Thêm mới
      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: `Sản phẩm chỉ còn lại ${product.stock} trong kho.` });
      }

      cart.items.push({
        product: product._id,
        shop: product.shop._id,
        quantity,
        price: product.price,
        subtotal: product.price * quantity,
      });
    }

    recalculateCartTotal(cart);
    await cart.save();
    
    // Populate data trả về
    await cart.populate('items.product', 'name price images');
    await cart.populate('items.shop', 'shopName');

    res.json({ success: true, message: 'Đã thêm vào giỏ', data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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

    const cart = await Cart.findOne({ customer: req.user._id });
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

    const cart = await Cart.findOne({ customer: req.user._id });
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