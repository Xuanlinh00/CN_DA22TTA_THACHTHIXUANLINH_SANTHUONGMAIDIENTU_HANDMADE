import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '../../utils/formatters';
import Loading from '../../components/common/Loading';

const ShopOrders = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['shop-orders'],
    queryFn: () => orderService.getShopOrders(),
  });

  if (isLoading) return <Loading />;

  const orders = data?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-primary-900 mb-8">
        Quản lý đơn hàng
      </h1>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <FiPackage className="mx-auto text-primary-300 mb-4" size={60} />
          <p className="text-primary-600">Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Mã đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-primary-700 uppercase">
                    Thao tác
                  </th>
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
                      <div className="text-sm text-primary-900">
                        {order.shippingAddress?.fullName}
                      </div>
                      <div className="text-sm text-primary-500">
                        {order.shippingAddress?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-900">
                        {formatDateTime(order.createdAt)}
                      </div>
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
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-primary-700 hover:text-primary-900 font-medium"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopOrders;
