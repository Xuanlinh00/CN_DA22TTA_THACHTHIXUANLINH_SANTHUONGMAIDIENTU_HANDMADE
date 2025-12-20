import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiPackage, FiEdit } from 'react-icons/fi';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import ShopLayout from '../../components/layout/ShopLayout';
import toast from 'react-hot-toast';

const ShopOrders = () => {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['shop-orders'],
    queryFn: () => orderService.getShopOrders(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => orderService.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['shop-orders']);
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    if (window.confirm('Bạn có chắc muốn cập nhật trạng thái đơn hàng?')) {
      updateStatusMutation.mutate({ orderId, status: newStatus });
    }
  };

  if (isLoading) return <Loading />;

  const orders = data?.data || [];

  return (
    <ShopLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-sans font-bold text-primary-900">
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
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="text-sm border border-primary-300 rounded px-2 py-1"
                        disabled={updateStatusMutation.isPending}
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="processing">Đang chuẩn bị</option>
                        <option value="shipping">Đang giao hàng</option>
                        <option value="delivered">Đã giao</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
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
    </ShopLayout>
  );
};

export default ShopOrders;
