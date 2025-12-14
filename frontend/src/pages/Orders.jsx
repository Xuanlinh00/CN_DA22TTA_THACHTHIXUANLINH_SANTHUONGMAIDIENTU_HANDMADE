import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import { orderService } from '../services/orderService';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '../utils/formatters';
import Loading from '../components/common/Loading';

const Orders = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getMyOrders(),
  });

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product-tiny.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    // Remove /api from the URL if present, since images are served at /uploads not /api/uploads
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  if (isLoading) return <Loading />;

  const orders = data?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-primary-900 mb-8">
        Đơn hàng của tôi
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <FiPackage className="mx-auto text-primary-300 mb-4" size={80} />
          <h2 className="text-2xl font-bold text-primary-900 mb-4">
            Chưa có đơn hàng nào
          </h2>
          <Link to="/products" className="btn-primary">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="card p-6 hover:shadow-lg transition-shadow block"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-primary-600">Mã đơn hàng</p>
                  <p className="font-semibold text-primary-900">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-600">Ngày đặt</p>
                  <p className="font-medium text-primary-900">{formatDateTime(order.createdAt)}</p>
                </div>
                <div>
                  <span className={`badge badge-${getOrderStatusColor(order.orderStatus)}`}>
                    {getOrderStatusLabel(order.orderStatus)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-primary-600">Tổng tiền</p>
                  <p className="text-xl font-bold text-accent-600">
                    {formatCurrency(order.totalPrice)}
                  </p>
                </div>
              </div>

              <div className="border-t border-primary-200 pt-4">
                <div className="flex items-center gap-3">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <img
                      key={idx}
                      src={getImageUrl(item.product?.images?.[0])}
                      alt=""
                      className="w-16 h-16 object-cover rounded"
                    />
                  ))}
                  {order.items?.length > 3 && (
                    <div className="w-16 h-16 bg-primary-100 rounded flex items-center justify-center text-primary-700 font-medium">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
