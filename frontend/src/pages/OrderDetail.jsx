import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiMapPin, FiTruck, FiCreditCard, FiPackage } from 'react-icons/fi';
import { orderService } from '../services/orderService';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '../utils/formatters';
import Loading from '../components/common/Loading';

const OrderDetail = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id),
  });

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product-medium.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    // Remove /api from the URL if present, since images are served at /uploads not /api/uploads
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  if (isLoading) return <Loading fullScreen />;

  const order = data?.data;
  if (!order) return <div className="container mx-auto px-4 py-20 text-center">Không tìm thấy đơn hàng</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
          Chi tiết đơn hàng
        </h1>
        <p className="text-primary-600">
          Mã đơn: <span className="font-semibold">#{order._id.slice(-8).toUpperCase()}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 mb-1">Trạng thái đơn hàng</p>
                <span className={`badge badge-${getOrderStatusColor(order.orderStatus)} text-base`}>
                  {getOrderStatusLabel(order.orderStatus)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-600 mb-1">Ngày đặt</p>
                <p className="font-medium text-primary-900">{formatDateTime(order.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-primary-900 mb-4 flex items-center">
              <FiPackage className="mr-2" />
              Sản phẩm
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b border-primary-200 last:border-0">
                  <img
                    src={getImageUrl(item.product?.images?.[0])}
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded"
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
                {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}
              </p>
              <p className={`mt-2 badge ${order.isPaid ? 'badge-success' : 'badge-warning'}`}>
                {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
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
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-xl font-semibold text-primary-900 mb-4">
              Tổng đơn hàng
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-primary-700">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.totalPrice - (order.shippingFee || 0))}</span>
              </div>
              <div className="flex justify-between text-primary-700">
                <span>Phí vận chuyển</span>
                <span>{formatCurrency(order.shippingFee || 0)}</span>
              </div>
              <div className="border-t border-primary-200 pt-3 flex justify-between text-lg font-bold text-primary-900">
                <span>Tổng cộng</span>
                <span className="text-accent-600">{formatCurrency(order.totalPrice)}</span>
              </div>
            </div>

            {order.orderStatus === 'pending_payment' && (
              <button className="w-full btn-primary mt-6">
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
