import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiPackage } from 'react-icons/fi';
import { orderService } from '../services/orderService';
import OrderTracking from '../components/order/OrderTracking';
import Loading from '../components/common/Loading';
import { formatCurrency } from '../utils/formatters';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['track-order', orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: searchTriggered && orderId.length > 0,
    retry: false,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      setSearchTriggered(true);
    }
  };

  const order = data?.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-sans font-bold text-primary-900 mb-4">
            Theo dõi đơn hàng
          </h1>
          <p className="text-primary-600">
            Nhập mã đơn hàng để theo dõi tình trạng giao hàng
          </p>
        </div>

        {/* Search Form */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Nhập mã đơn hàng (VD: HD12345678)"
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={!orderId.trim() || isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              <FiSearch />
              <span>Tìm kiếm</span>
            </button>
          </form>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <Loading />
          </div>
        )}

        {/* Error */}
        {error && searchTriggered && (
          <div className="card p-6 text-center">
            <FiPackage className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-primary-900 mb-2">
              Không tìm thấy đơn hàng
            </h3>
            <p className="text-primary-600">
              Vui lòng kiểm tra lại mã đơn hàng và thử lại
            </p>
          </div>
        )}

        {/* Order Found */}
        {order && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="card p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-primary-900 mb-2">Thông tin đơn hàng</h3>
                  <p className="text-sm text-primary-600">
                    Mã đơn: <span className="font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                  </p>
                  <p className="text-sm text-primary-600">
                    Tổng tiền: <span className="font-medium text-accent-600">{formatCurrency(order.totalPrice)}</span>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-900 mb-2">Thông tin giao hàng</h3>
                  <p className="text-sm text-primary-600">
                    {order.shippingAddress?.fullName}
                  </p>
                  <p className="text-sm text-primary-600">
                    {order.shippingAddress?.phone}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-900 mb-2">Thanh toán</h3>
                  <p className="text-sm text-primary-600">
                    {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}
                  </p>
                  <p className={`text-sm ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Tracking */}
            <OrderTracking order={order} />

            {/* Products */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">
                Sản phẩm trong đơn hàng
              </h3>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b border-primary-200 last:border-0">
                    <img
                      src={getImageUrl(item.product?.images?.[0])}
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src = '/default-product.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-primary-900">{item.product?.name}</p>
                      <p className="text-sm text-primary-600 mt-1">Số lượng: {item.quantity}</p>
                      <p className="text-sm font-medium text-accent-600 mt-1">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent-600">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="card p-6 mt-8">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">
            Cần hỗ trợ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-primary-900 mb-2">Liên hệ hỗ trợ</h4>
              <p className="text-sm text-primary-600 mb-2">
                Hotline: <span className="font-medium">1900 1234</span>
              </p>
              <p className="text-sm text-primary-600">
                Email: <span className="font-medium">support@craftify.com</span>
              </p>
            </div>
            <div>
              <h4 className="font-medium text-primary-900 mb-2">Thời gian hỗ trợ</h4>
              <p className="text-sm text-primary-600 mb-1">Thứ 2 - Thứ 6: 8:00 - 18:00</p>
              <p className="text-sm text-primary-600">Thứ 7 - Chủ nhật: 9:00 - 17:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;