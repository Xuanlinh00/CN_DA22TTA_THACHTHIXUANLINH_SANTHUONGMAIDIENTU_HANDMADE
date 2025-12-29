import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiMapPin, FiTruck, FiCreditCard, FiPackage, FiStar, FiMessageCircle } from 'react-icons/fi';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '../utils/formatters';
import Loading from '../components/common/Loading';
import OrderTracking from '../components/order/OrderTracking';
import ReviewForm from '../components/order/ReviewForm';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [reviewingItem, setReviewingItem] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id),
  });

  const confirmDeliveryMutation = useMutation({
    mutationFn: () => orderService.confirmDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['order', id]);
      toast.success('Xác nhận đã nhận hàng thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xác nhận thất bại');
    },
  });

  const handleVNPayPayment = async () => {
    try {
      setIsPaymentLoading(true);
      const response = await paymentService.createVNPayPayment(id);
      
      if (response.success && response.data.paymentUrl) {
        toast.success('Đang chuyển đến trang thanh toán VNPAY...');
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error('Không thể tạo thanh toán VNPAY');
      }
    } catch (error) {
      console.error('❌ Lỗi tạo thanh toán VNPAY:', error);
      toast.error('Lỗi tạo thanh toán. Vui lòng thử lại sau.');
    } finally {
      setIsPaymentLoading(false);
    }
  };

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
          {/* Order Tracking */}
          <OrderTracking order={order} />

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
                    {/* Nút đánh giá - hiển thị khi đơn hàng đã giao */}
                    {order.status === 'delivered' && !item.reviewed && (
                      <button
                        onClick={() => setReviewingItem(item)}
                        className="mt-2 text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors flex items-center gap-1 mx-auto"
                      >
                        <FiStar size={14} />
                        Đánh giá
                      </button>
                    )}
                    {item.reviewed && (
                      <p className="mt-2 text-xs text-green-600 font-medium">✓ Đã đánh giá</p>
                    )}
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
              
              {/* Hiển thị thông tin VNPAY nếu có */}
              {order.vnpayData && order.vnpayData.transactionNo && (
                <div className="mt-3 text-sm text-primary-600">
                  <p>Mã GD: {order.vnpayData.transactionNo}</p>
                  <p>Ngân hàng: {order.vnpayData.bankCode}</p>
                </div>
              )}
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

          {/* Nút nhắn tin shop */}
          {order.items && order.items.length > 0 && (
            <button
              onClick={() => {
                const shopId = order.items[0].product?.shop?._id || order.items[0].shop?._id;
                if (shopId) {
                  navigate(`/messages?shop=${shopId}`);
                }
              }}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors"
            >
              <FiMessageCircle size={20} />
              Nhắn tin shop
            </button>
          )}
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

            {/* Nút thanh toán VNPAY nếu chưa thanh toán */}
            {order.paymentMethod === 'VNPAY' && order.paymentStatus === 'pending' && (
              <button 
                onClick={handleVNPayPayment}
                disabled={isPaymentLoading}
                className="w-full btn-primary mt-6 disabled:opacity-50"
              >
                {isPaymentLoading ? 'Đang xử lý...' : 'Thanh toán ngay'}
              </button>
            )}

            {/* Nút xác nhận đã nhận hàng khi đang giao */}
            {order.status === 'shipping' && (
              <button 
                onClick={() => {
                  if (window.confirm('Bạn xác nhận đã nhận được hàng?')) {
                    confirmDeliveryMutation.mutate();
                  }
                }}
                disabled={confirmDeliveryMutation.isPending}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 mt-6"
              >
                {confirmDeliveryMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đã nhận hàng'}
              </button>
            )}

            {order.status === 'pending' && (
              <button className="w-full btn-outline mt-3">
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {reviewingItem && (
        <ReviewForm
          item={reviewingItem}
          orderId={id}
          onClose={() => setReviewingItem(null)}
        />
      )}
    </div>
  );
};

export default OrderDetail;
