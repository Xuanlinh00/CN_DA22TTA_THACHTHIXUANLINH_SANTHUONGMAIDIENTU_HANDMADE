import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import useAuthStore from '../../stores/authStore';

const NotificationBadge = () => {
  const { user } = useAuthStore();
  
  const { data: ordersData } = useQuery({
    queryKey: ['shop-orders'],
    queryFn: () => orderService.getShopOrders(),
    enabled: user?.role === 'shop_owner',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (user?.role !== 'shop_owner') return null;

  const orders = ordersData?.data || [];
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  if (pendingCount === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {pendingCount > 9 ? '9+' : pendingCount}
    </span>
  );
};

export default NotificationBadge;