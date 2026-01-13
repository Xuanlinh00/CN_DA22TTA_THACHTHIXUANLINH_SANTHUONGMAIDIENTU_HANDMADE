import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiMapPin, FiTruck, FiCreditCard, FiPackage, FiMessageCircle } from 'react-icons/fi';
import { orderService } from '../../services/orderService';
import useAuthStore from '../../stores/authStore';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import ShopLayout from '../../components/layout/ShopLayout';
import toast from 'react-hot-toast';

const ShopOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => orderService.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['order', id]);
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  const handleStatusChange = (newStatus) => {
    if (window.confirm('Bạn có chắc muốn cập nhật trạng thái đơn hàng?')) {
      updateStatusMutation.mutate({ orderId: id, status: newStatus });
    }
  };

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product-medium.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  if (isLoading) return <Loading />;

  const order = data?.data;
  if (!order) return <div className="container mx-auto px-4 py-20 text-center">Không tìm thấy đơn hàng</div>;

  // Backend đã lọc items, không cần lọc lại
  const shopItems = order.items || [];
  
  if (shopItems.length === 0) {
    return (
      <ShopLayout>
        <div className="card p-12 text-center">
          <p className="text-primary-600">Đơn hàng này không có sản phẩm của shop bạn</p>
        </div>
      </ShopLayout>
    );
  }

  // Calculate shop's subtotal
  const shopSubtotal = shopItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <ShopLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-sans font-bold text-primary-900 mb-2">
            Chi tiết đơn hàng
          </h1>
          <p className="text-primary-600">
            Mã đơn: <span className="font-semibold">#{order._id.slice(-8).toUpperCase()}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4 flex items-center">
                <FiPackage className="mr-2" />
                Sản phẩm của shop
              </h2>
              <div className="space-y-4">
                {shopItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b border-primary-200 last:border-0">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-primary-900">{item.name}</p>
                      <p className="text-sm text-primary-600 mt-1">Số lượng: {item.quantity}</p>
                      <p className="text-sm font-medium text-accent-600 mt-1">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent-600">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4 flex items-center">
                <FiMapPin className="mr-2" />
                Địa chỉ giao hàng
              </h2>
              <div className="text-primary-700">
                <p className="font-semibold text-primary-900">{order.shippingAddress?.fullName}</p>
                <p className="mt-1">{order.shippingAddress?.phone}</p>
                <p className="mt-2">
                  {order.shippingAddress?.street}, {order.shippingAddress?.ward},{' '}
                  {order.shippingAddress?.district}, {order.shippingAddress?.city}
                </p>
              </div>
            </div>

            {/* Payment & Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-semibold text-primary-900 mb-3 flex items-center">
                  <FiCreditCard className="mr-2" />
                  Thanh toán
                </h3>
                <p className="text-primary-700">
                  {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 
                   order.paymentMethod === 'VNPAY' ? 'Thanh toán qua VNPAY' : 'Chuyển khoản'}
                </p>
                <p className={`mt-2 badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                  {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-primary-900 mb-3 flex items-center">
                  <FiTruck className="mr-2" />
                  Vận chuyển
                </h3>
                <p className="text-primary-700">Giao hàng tiêu chuẩn</p>
                <p className="mt-2 text-sm text-primary-600">
                  Phí ship: {formatCurrency(order.shippingFee || 0)}
                </p>
              </div>
            </div>

            {/* Status Update */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">Cập nhật trạng thái</h2>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updateStatusMutation.isPending}
                className="w-full px-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="processing">Đang chuẩn bị</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            {/* Message Button */}
            <button
              onClick={() => navigate(`/messages?shop=${order.items[0]?.shop?._id}`)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors"
            >
              <FiMessageCircle size={20} />
              Nhắn tin khách hàng
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">
                Tổng đơn hàng
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-primary-700">
                  <span>Tạm tính (shop)</span>
                  <span>{formatCurrency(shopSubtotal)}</span>
                </div>
                <div className="flex justify-between text-primary-700 text-sm">
                  <span>Phí vận chuyển (toàn đơn)</span>
                  <span>{formatCurrency(order.shippingFee || 0)}</span>
                </div>
                <div className="border-t border-primary-200 pt-3 flex justify-between text-lg font-bold text-primary-900">
                  <span>Tổng cộng</span>
                  <span className="text-accent-600">{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>

              {/* Order Status Badge */}
              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-600 mb-2">Trạng thái đơn hàng</p>
                <p className={`text-lg font-semibold ${getOrderStatusColor(order.status)}`}>
                  {getOrderStatusLabel(order.status)}
                </p>
              </div>

              {/* Order Info */}
              <div className="mt-6 space-y-2 text-sm text-primary-600">
                <p>
                  <span className="font-medium">Ngày đặt:</span> {formatDateTime(order.createdAt)}
                </p>
                {order.deliveredAt && (
                  <p>
                    <span className="font-medium">Ngày giao:</span> {formatDateTime(order.deliveredAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
};

export default ShopOrderDetail;
