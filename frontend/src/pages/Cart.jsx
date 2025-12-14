import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import useCartStore from '../stores/cartStore';
import { formatCurrency } from '../utils/formatters';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCartStore();

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
      <h1 className="text-3xl font-display font-bold text-primary-900 mb-8">
        Giỏ hàng của bạn
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4">
              <img
                src={getImageUrl(item.images?.[0])}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg"
              />

              <div className="flex-1">
                <Link
                  to={`/products/${item._id}`}
                  className="font-semibold text-primary-900 hover:text-primary-700 line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-primary-600 mt-1">
                  {item.shop?.shopName}
                </p>
                <p className="text-lg font-bold text-accent-600 mt-2">
                  {formatCurrency(item.price)}
                </p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <FiTrash2 size={20} />
                </button>

                <div className="flex items-center space-x-2 border border-primary-300 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="p-2 hover:bg-primary-100 rounded-l-lg"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="px-4 font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="p-2 hover:bg-primary-100 rounded-r-lg"
                    disabled={item.quantity >= item.stock}
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
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
