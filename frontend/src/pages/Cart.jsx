import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiZap, FiPackage } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { orderService } from '../services/orderService';
import OrderStatusBadge from '../components/order/OrderStatusBadge';
import OrderProgressBar from '../components/order/OrderProgressBar';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCartStore();
  const [activeTab, setActiveTab] = useState('cart');

  // Admin không có giỏ hàng, redirect sang admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user?.role, navigate]);

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getMyOrders(),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId) => orderService.cancel(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-orders']);
      toast.success('Hủy đơn hàng thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hủy đơn hàng thất bại');
    },
  });

  const itemsByShop = items.reduce((acc, item) => {
    const shopId = item.shop?._id || 'unknown';
    if (!acc[shopId]) {
      acc[shopId] = { shop: item.shop, items: [] };
    }
    acc[shopId].items.push(item);
    return acc;
  }, {});

  const handleBuyNow = (item) => {
    sessionStorage.setItem('tempCart', JSON.stringify([item]));
    navigate('/checkout');
  };

  const handleBuyShop = (shopId) => {
    sessionStorage.setItem('tempCart', JSON.stringify(itemsByShop[shopId].items));
    navigate('/checkout');
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product-small.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  const orders = ordersData?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Tài khoản của tôi
      </h1>

      {/* Tabs */}
      <div className="card p-4 mb-6 border-b border-primary-200 bg-orange-50">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('cart')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 rounded-t-lg ${
              activeTab === 'cart'
                ? 'bg-orange-500 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            <FiShoppingBag size={18} />
            Giỏ hàng ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 rounded-t-lg ${
              activeTab === 'orders'
                ? 'bg-orange-500 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            <FiPackage size={18} />
            Đơn hàng của tôi ({orders.length})
          </button>
        </div>
      </div>

      {/* Cart Tab */}
      {activeTab === 'cart' && (
        <>
          {items.length === 0 ? (
            <div className="text-center py-20">
              <FiShoppingBag className="mx-auto text-primary-300 mb-4" size={80} />
              <h2 className="text-2xl font-bold text-primary-900 mb-4">Giỏ hàng trống</h2>
              <p className="text-primary-600 mb-8">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
              <Link to="/products" className="btn-primary">Khám phá sản phẩm</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {Object.entries(itemsByShop).map(([shopId, { shop, items: shopItems }]) => (
                  <div key={shopId} className="card overflow-hidden">
                    <div className="bg-primary-50 p-4 border-b border-primary-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={shop?.avatar || '/default-shop-avatar.jpg'} alt={shop?.shopName} className="w-10 h-10 rounded-full object-cover" />
                        <Link to={`/shops/${shop?._id}`} className="font-semibold text-primary-900 hover:text-primary-700">
                          {shop?.shopName || 'Cửa hàng'}
                        </Link>
                      </div>
                      <button onClick={() => handleBuyShop(shopId)} className="btn-secondary flex items-center gap-2 text-sm">
                        <FiZap size={16} />
                        Mua tất cả
                      </button>
                    </div>

                    <div className="space-y-3 p-4">
                      {shopItems.map((item) => (
                        <div key={item._id} className="flex gap-4 pb-3 border-b border-primary-100 last:border-0 last:pb-0">
                          <img src={getImageUrl(item.images?.[0])} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                          <div className="flex-1">
                            <Link to={`/products/${item._id}`} className="font-semibold text-primary-900 hover:text-primary-700 line-clamp-2">
                              {item.name}
                            </Link>
                            <p className="text-lg font-bold text-accent-600 mt-1">{formatCurrency(item.price)}</p>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <button onClick={() => removeFromCart(item._id)} className="text-red-600 hover:text-red-700">
                              <FiTrash2 size={18} />
                            </button>
                            <div className="flex items-center space-x-1 border border-primary-300 rounded-lg">
                              <button onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))} className="p-1 hover:bg-primary-100">
                                <FiMinus size={14} />
                              </button>
                              <span className="px-3 font-medium text-sm">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 hover:bg-primary-100" disabled={item.quantity >= item.stock}>
                                <FiPlus size={14} />
                              </button>
                            </div>
                            <button onClick={() => handleBuyNow(item)} className="bg-accent-500 hover:bg-accent-600 text-white font-medium text-sm px-3 py-1.5 rounded flex items-center gap-1 mt-2 transition-colors">
                              <FiZap size={14} />
                              Mua ngay
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={clearCart} className="text-red-600 hover:text-red-700 font-medium">Xóa tất cả</button>
              </div>

              <div className="lg:col-span-1">
                <div className="card p-6 sticky top-20">
                  <h2 className="text-xl font-semibold text-primary-900 mb-4">Tổng đơn hàng</h2>
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
                  <button onClick={() => navigate('/checkout')} className="w-full btn-primary mb-3">Thanh toán</button>
                  <Link to="/products" className="block text-center text-primary-700 hover:text-primary-900 font-medium">Tiếp tục mua sắm</Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <>
          {ordersLoading ? (
            <Loading />
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <FiPackage className="mx-auto text-primary-300 mb-4" size={80} />
              <h2 className="text-2xl font-bold text-primary-900 mb-4">Chưa có đơn hàng nào</h2>
              <p className="text-primary-600 mb-8">Hãy mua sắm để tạo đơn hàng đầu tiên</p>
              <Link to="/products" className="btn-primary">Mua sắm ngay</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <Link to={`/orders/${order._id}`} className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-primary-600 mb-1">Mã đơn hàng</p>
                          <p className="font-semibold text-primary-900">#{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-primary-600 mb-1">Ngày đặt</p>
                          <p className="font-medium text-primary-900">{formatDateTime(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-primary-600 mb-1">Trạng thái</p>
                          <OrderStatusBadge status={order.status} size="sm" />
                        </div>
                        <div>
                          <p className="text-sm text-primary-600 mb-1">Thanh toán</p>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.paymentStatus === 'paid' ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-primary-600 mb-1">Tổng tiền</p>
                          <p className="text-xl font-bold text-accent-600">{formatCurrency(order.totalPrice)}</p>
                        </div>
                      </div>
                    </Link>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                            cancelOrderMutation.mutate(order._id);
                          }
                        }}
                        disabled={cancelOrderMutation.isPending}
                        className="ml-4 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        {cancelOrderMutation.isPending ? 'Đang hủy...' : 'Hủy đơn'}
                      </button>
                    )}
                  </div>
                  <Link to={`/orders/${order._id}`} className="block">
                    <div className="mb-4">
                      <OrderProgressBar status={order.status} />
                    </div>
                    <div className="border-t border-primary-200 pt-4">
                      <div className="flex items-center gap-3">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <img key={idx} src={getImageUrl(item.product?.images?.[0])} alt="" className="w-16 h-16 object-cover rounded" onError={(e) => { e.target.src = '/default-product.jpg'; }} />
                        ))}
                        {order.items?.length > 3 && (
                          <div className="w-16 h-16 bg-primary-100 rounded flex items-center justify-center text-primary-700 font-medium text-sm">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;
