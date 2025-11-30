const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// Lấy giỏ hàng của user
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id })
      .populate('items.product', 'name price images')
      .populate('items.shop', 'shopName');

    if (!cart) {
      return res.json({ success: true, data: { items: [], totalPrice: 0 } });
    }

    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Thêm sản phẩm vào giỏ
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId).populate('shop');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      cart = new Cart({ customer: req.user._id, items: [] });
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.items.find(item => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
      cart.items.push({
        product: product._id,
        shop: product.shop._id,
        quantity,
        price: product.price,
        subtotal: product.price * quantity,
      });
    }

    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Xoá sản phẩm khỏi giỏ
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại' });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart };