import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '../../utils/formatters';
import Loading from '../../components/common/Loading';

const AdminOrders = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => orderService.getAllOrders(),
  });

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
        Quản lý đơn hàng
      </h1>

      {/* Status Filter Tabs */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Tất cả' },
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
        <div className="text-center py-12">
          <p className="text-primary-600 text-lg">Không có đơn hàng nào</p>
        </div>
      ) : (
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
                {filteredOrders.map((order) => (
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
                      <span className={`badge badge-${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
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
      )}
    </div>
  );
};

export default AdminOrders;
