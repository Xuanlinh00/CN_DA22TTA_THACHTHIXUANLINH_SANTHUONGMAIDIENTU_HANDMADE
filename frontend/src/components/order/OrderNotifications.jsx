import { useQuery } from '@tanstack/react-query';
import { FiBell, FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { orderService } from '../../services/orderService';
import { formatDateTime } from '../../utils/formatters';
import useAuthStore from '../../stores/authStore';

const OrderNotifications = () => {
  const { user } = useAuthStore();
  
  const { data: ordersData } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getMyOrders(),
    enabled: !!user && user.role === 'user',
    refetchInterval: 60000, // Refresh every minute
  });

  if (!user || user.role !== 'user') return null;

  const orders = ordersData?.data || [];
  
  // Lấy đơn hàng có cập nhật trong 24h qua
  const recentUpdates = orders.filter(order => {
    const updatedAt = new Date(order.updatedAt);
    const now = new Date();
    const diffHours = (now - updatedAt) / (1000 * 60 * 60);
    return diffHours <= 24 && order.status !== 'pending';
  });

  const getNotificationIcon = (status) => {
    switch (status) {
      case 'confirmed': return FiCheckCircle;
      case 'processing': return FiPackage;
      case 'shipping': return FiTruck;
      case 'delivered': return FiCheckCircle;
      default: return FiBell;
    }
  };

  const getNotificationMessage = (status) => {
    switch (status) {
      case 'confirmed': return 'Đơn hàng đã được xác nhận';
      case 'processing': return 'Đơn hàng đang được chuẩn bị';
      case 'shipping': return 'Đơn hàng đang được giao';
      case 'delivered': return 'Đơn hàng đã được giao thành công';
      case 'cancelled': return 'Đơn hàng đã bị hủy';
      default: return 'Đơn hàng có cập nhật mới';
    }
  };

  if (recentUpdates.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className="space-y-2">
        {recentUpdates.slice(0, 3).map((order) => {
          const Icon = getNotificationIcon(order.status);
          
          return (
            <div
              key={order._id}
              className="bg-white border border-primary-200 rounded-lg shadow-lg p-4 animate-slide-in-right"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="text-blue-600" size={16} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-900">
                    {getNotificationMessage(order.status)}
                  </p>
                  <p className="text-xs text-primary-600 mt-1">
                    Đơn hàng #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-primary-500 mt-1">
                    {formatDateTime(order.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderNotifications;