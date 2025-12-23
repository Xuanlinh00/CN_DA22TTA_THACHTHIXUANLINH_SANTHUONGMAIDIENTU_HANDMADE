import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiPackage, FiStar } from 'react-icons/fi';
import { useState } from 'react';
import { orderService } from '../services/orderService';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import Loading from '../components/common/Loading';
import OrderStatusBadge from '../components/order/OrderStatusBadge';
import OrderProgressBar from '../components/order/OrderProgressBar';
import ReviewForm from '../components/order/ReviewForm';

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewingItem, setReviewingItem] = useState(null);
  
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getMyOrders(),
  });

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product-tiny.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  if (isLoading) return <Loading />;

  const orders = data?.data || [];
  
  // Filter orders based on status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Đơn hàng của tôi
      </h1>

      {/* Status Filter Tabs */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Tất cả', icon: FiPackage },
            { key: 'pending', label: 'Chờ thanh toán' },
            { key: 'paid', label: 'Đã thanh toán' },
            { key: 'processing', label: 'Đang chuẩn bị' },
            { key: 'shipping', label: 'Đang giao' },
            { key: 'delivered', label: 'Đã giao' },
            { key: 'cancelled', label: 'Đã hủy' },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            const count = statusCounts[tab.key];
            
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isActive ? 'bg-white text-primary-700' : 'bg-primary-200 text-primary-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
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
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <Link
                to={`/orders/${order._id}`}
                className="block"
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
                  <div className="flex flex-col items-end space-y-2">
                    <OrderStatusBadge status={order.status} size="sm" />
                    <div className="w-32">
                      <OrderProgressBar status={order.status} />
                    </div>
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

              {/* Nút đánh giá - nằm ngoài Link */}
              {order.status === 'delivered' && order.items?.some(item => !item.reviewed) && (
                <div className="mt-4 pt-4 border-t border-primary-200">
                  <div className="flex flex-wrap gap-2">
                    {order.items?.map((item, idx) => (
                      !item.reviewed && (
                        <button
                          key={idx}
                          onClick={() => setReviewingItem({ ...item, orderId: order._id })}
                          className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors text-sm"
                        >
                          <FiStar size={14} />
                          Đánh giá: {item.product?.name?.substring(0, 20)}...
                        </button>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Form Modal */}
      {reviewingItem && (
        <ReviewForm
          item={reviewingItem}
          orderId={reviewingItem.orderId}
          onClose={() => setReviewingItem(null)}
        />
      )}
    </div>
  );
};

export default Orders;
