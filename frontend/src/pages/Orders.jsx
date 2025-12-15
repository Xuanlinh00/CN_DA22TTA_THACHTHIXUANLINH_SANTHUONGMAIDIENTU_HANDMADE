import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingCart } from 'react-icons/fi';
import { useState } from 'react';
import { orderService } from '../services/orderService';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '../utils/formatters';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const Orders = () => {
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getMyOrders(),
  });

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o._id));
    }
  };

  const getTotalSelected = () => {
    return orders
      .filter(o => selectedOrders.includes(o._id))
      .reduce((sum, o) => sum + o.totalPrice, 0);
  };

  const handleCheckout = () => {
    if (selectedOrders.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 đơn hàng');
      return;
    }
    // TODO: Redirect to checkout with selected orders
    toast.success(`Đã chọn ${selectedOrders.length} đơn hàng`);
  };

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product-tiny.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    // Remove /api from the URL if present, since images are served at /uploads not /api/uploads
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  if (isLoading) return <Loading />;

  const orders = data?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Đơn hàng của tôi
      </h1>

      {orders.length === 0 ? (
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
        <>
          {/* Selection Toolbar */}
          <div className="card p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedOrders.length === orders.length && orders.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 cursor-pointer"
              />
              <span className="text-primary-700 font-medium">
                {selectedOrders.length > 0 
                  ? `Đã chọn ${selectedOrders.length} đơn hàng` 
                  : 'Chọn tất cả'}
              </span>
            </div>
            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-primary-600">Tổng tiền</p>
                  <p className="text-xl font-bold text-accent-600">
                    {formatCurrency(getTotalSelected())}
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiShoppingCart />
                  Thanh toán
                </button>
              </div>
            )}
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="card p-6 hover:shadow-lg transition-shadow flex items-start gap-4"
              >
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order._id)}
                  onChange={() => handleSelectOrder(order._id)}
                  className="w-5 h-5 cursor-pointer mt-1 flex-shrink-0"
                />
                <Link
                  to={`/orders/${order._id}`}
                  className="flex-1"
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
                    <div>
                      <span className={`badge badge-${getOrderStatusColor(order.orderStatus)}`}>
                        {getOrderStatusLabel(order.orderStatus)}
                      </span>
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
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
