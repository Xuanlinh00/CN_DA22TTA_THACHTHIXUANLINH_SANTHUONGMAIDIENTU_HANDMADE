import { Link, useNavigate } from 'react-router-dom';
// Đã sửa: Thay FiBolt bằng FiZap
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiZap } from 'react-icons/fi';
import { useState } from 'react';
import useCartStore from '../stores/cartStore';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCartStore();
  const [selectedItems, setSelectedItems] = useState([]);

  // Nhóm sản phẩm theo shop
  const itemsByShop = items.reduce((acc, item) => {
    const shopId = item.shop?._id || 'unknown';
    if (!acc[shopId]) {
      acc[shopId] = {
        shop: item.shop,
        items: []
      };
    }
    acc[shopId].items.push(item);
    return acc;
  }, {});

  const handleBuyNow = (item) => {
    // Tạo giỏ hàng tạm với chỉ sản phẩm này
    const tempCart = [item];
    sessionStorage.setItem('tempCart', JSON.stringify(tempCart));
    navigate('/checkout');
  };

  const handleBuyShop = (shopId) => {
    // Mua tất cả sản phẩm từ shop này
    const shopItems = itemsByShop[shopId].items;
    sessionStorage.setItem('tempCart', JSON.stringify(shopItems));
    navigate('/checkout');
  };

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product-small.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    // Remove /api from the URL if present, since images are served at /uploads not /api/uploads
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <FiShoppingBag className="mx-auto text-primary-300 mb-4" size={80} />
        <h2 className="text-2xl font-bold text-primary-900 mb-4">
          Giỏ hàng trống
        </h2>
        <p className="text-primary-600 mb-8">
          Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
        </p>
        <Link to="/products" className="btn-primary">
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Giỏ hàng của bạn
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items - Grouped by Shop */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(itemsByShop).map(([shopId, { shop, items: shopItems }]) => (
            <div key={shopId} className="card overflow-hidden">
              {/* Shop Header */}
              <div className="bg-primary-50 p-4 border-b border-primary-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={shop?.avatar || '/default-shop-avatar.jpg'}
                    alt={shop?.shopName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <Link
                    to={`/shops/${shop?._id}`}
                    className="font-semibold text-primary-900 hover:text-primary-700"
                  >
                    {shop?.shopName || 'Cửa hàng'}
                  </Link>
                </div>
                <button
                  onClick={() => handleBuyShop(shopId)}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  {/* Đã sửa: FiZap cho nút Mua tất cả */}
                  <FiZap size={16} />
                  Mua tất cả
                </button>
              </div>

              {/* Shop Items */}
              <div className="space-y-3 p-4">
                {shopItems.map((item) => (
                  <div key={item._id} className="flex gap-4 pb-3 border-b border-primary-100 last:border-0 last:pb-0">
                    <img
                      src={getImageUrl(item.images?.[0])}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <Link
                        to={`/products/${item._id}`}
                        className="font-semibold text-primary-900 hover:text-primary-700 line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-lg font-bold text-accent-600 mt-1">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiTrash2 size={18} />
                      </button>

                      <div className="flex items-center space-x-1 border border-primary-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                          className="p-1 hover:bg-primary-100"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="px-3 font-medium text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1 hover:bg-primary-100"
                          disabled={item.quantity >= item.stock}
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleBuyNow(item)}
                        className="bg-accent-500 hover:bg-accent-600 text-white font-medium text-sm px-3 py-1.5 rounded flex items-center gap-1 mt-2 transition-colors"
                      >
                        <FiZap size={14} />
                        Mua ngay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Xóa tất cả
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-xl font-semibold text-primary-900 mb-4">
              Tổng đơn hàng
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-primary-700">
                <span>Tạm tính</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
              <div className="flex justify-between text-primary-700">
                <span>Phí vận chuyển</span>
                <span className="text-sm">Tính sau</span>
              </div>
              <div className="border-t border-primary-200 pt-3 flex justify-between text-lg font-bold text-primary-900">
                <span>Tổng cộng</span>
                <span className="text-accent-600">{formatCurrency(getTotal())}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary mb-3"
            >
              Thanh toán
            </button>

            <Link
              to="/products"
              className="block text-center text-primary-700 hover:text-primary-900 font-medium"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;