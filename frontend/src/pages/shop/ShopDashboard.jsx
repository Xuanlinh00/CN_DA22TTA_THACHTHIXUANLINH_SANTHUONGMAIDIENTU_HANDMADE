import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiSettings } from 'react-icons/fi';
import { shopService } from '../../services/shopService';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import ShopLayout from '../../components/layout/ShopLayout';

const ShopDashboard = () => {
  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ['my-shop'],
    queryFn: shopService.getMyShop,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['shop-orders'],
    queryFn: () => orderService.getShopOrders(),
  });

  if (shopLoading) return <Loading fullScreen />;

  const shop = shopData?.data;
  const orders = ordersData?.data || [];

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-primary-900 mb-4">
          Bạn chưa có cửa hàng
        </h2>
        <Link to="/create-shop" className="btn-primary">
          Đăng ký cửa hàng ngay
        </Link>
      </div>
    );
  }

  return (
    <ShopLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-sans font-bold text-primary-900 mb-2">
              Dashboard
            </h1>
            <p className="text-primary-600">Chào mừng trở lại, {shop.shopName}!</p>
          </div>
          <Link to="/shop-dashboard/settings" className="btn-outline flex items-center space-x-2">
            <FiSettings />
            <span>Cài đặt</span>
          </Link>
        </div>

        {/* Shop Status */}
        {shop.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              ⏳ Cửa hàng của bạn đang chờ admin phê duyệt. Vui lòng kiên nhẫn!
            </p>
          </div>
        )}

        {shop.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              ❌ Cửa hàng của bạn đã bị từ chối. Vui lòng liên hệ admin để biết thêm chi tiết.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/shop-dashboard/products" className="card p-6 hover:shadow-lg transition-shadow">
            <FiPackage className="text-primary-700 mb-3" size={32} />
            <h3 className="text-xl font-semibold text-primary-900 mb-2">Quản lý sản phẩm</h3>
            <p className="text-primary-600">Thêm, sửa, xóa sản phẩm của bạn</p>
          </Link>

          <Link to="/shop-dashboard/orders" className="card p-6 hover:shadow-lg transition-shadow">
            <FiShoppingBag className="text-primary-700 mb-3" size={32} />
            <h3 className="text-xl font-semibold text-primary-900 mb-2">Quản lý đơn hàng</h3>
            <p className="text-primary-600">Xem và xử lý đơn hàng mới</p>
          </Link>

          <Link to="/shop-dashboard/settings" className="card p-6 hover:shadow-lg transition-shadow">
            <FiSettings className="text-primary-700 mb-3" size={32} />
            <h3 className="text-xl font-semibold text-primary-900 mb-2">Cài đặt cửa hàng</h3>
            <p className="text-primary-600">Cập nhật thông tin cửa hàng</p>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiShoppingBag className="text-blue-600" size={24} />
              </div>
              <span className="text-sm text-primary-600">Tổng đơn</span>
            </div>
            <p className="text-3xl font-bold text-primary-900">{totalOrders}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiPackage className="text-yellow-600" size={24} />
              </div>
              <span className="text-sm text-primary-600">Chờ xử lý</span>
            </div>
            <p className="text-3xl font-bold text-primary-900">{pendingOrders}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiTrendingUp className="text-green-600" size={24} />
              </div>
              <span className="text-sm text-primary-600">Hoàn thành</span>
            </div>
            <p className="text-3xl font-bold text-primary-900">{completedOrders}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💵</span>
              </div>
              <span className="text-sm text-primary-600">Doanh thu</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
};

export default ShopDashboard;