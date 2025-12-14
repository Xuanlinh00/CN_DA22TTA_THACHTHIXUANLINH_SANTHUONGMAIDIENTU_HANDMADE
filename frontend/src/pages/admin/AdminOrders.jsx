import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '../../utils/formatters';
import Loading from '../../components/common/Loading';

const AdminOrders = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => orderService.getAllOrders(),
  });

  if (isLoading) return <Loading />;

  const orders = data?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-primary-900 mb-8">
        Quản lý đơn hàng
      </h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">Mã đơn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">Ngày đặt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-primary-700 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-primary-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-primary-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-primary-900">
                      #{order._id.slice(-8).toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-900">{order.shippingAddress?.fullName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-900">{formatDateTime(order.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-accent-600">
                      {formatCurrency(order.totalPrice)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge badge-${getOrderStatusColor(order.orderStatus)}`}>
                      {getOrderStatusLabel(order.orderStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link to={`/orders/${order._id}`} className="text-primary-700 hover:text-primary-900 font-medium">
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
