import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiDollarSign, FiPackage, FiTrendingUp } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';
import Loading from '../../components/common/Loading';

const AdminDashboard = () => {
  const { data: revenueData } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: adminService.getRevenueStats,
  });

  const { data: orderStatsData } = useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: adminService.getOrderStats,
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getAllUsers,
  });

  const { data: shopsData } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: () => adminService.getAllShops(),
  });

  const { data: pendingShopsData } = useQuery({
    queryKey: ['admin-pending-shops'],
    queryFn: adminService.getPendingShops,
  });

  const stats = {
    totalUsers: usersData?.data?.length || 0,
    totalShops: shopsData?.data?.length || 0,
    pendingShops: pendingShopsData?.data?.length || 0,
    totalRevenue: revenueData?.data?.totalRevenue || 0,
    totalOrders: revenueData?.data?.totalOrders || 0,
    orderStats: orderStatsData?.data || {},
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUsers className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-primary-900 mb-1">{stats.totalUsers}</p>
          <p className="text-sm text-primary-600">Tổng người dùng</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <MdStorefront className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-primary-900 mb-1">{stats.totalShops}</p>
          <p className="text-sm text-primary-600">Tổng cửa hàng</p>
          {stats.pendingShops > 0 && (
            <p className="text-xs text-yellow-600 mt-1">
              {stats.pendingShops} chờ duyệt
            </p>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiShoppingBag className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-primary-900 mb-1">{stats.totalOrders}</p>
          <p className="text-sm text-primary-600">Tổng đơn hàng</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent-100 rounded-lg">
              <FiDollarSign className="text-accent-600" size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-accent-600 mb-1">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <p className="text-sm text-primary-600">Tổng doanh thu</p>
        </div>
      </div>

      {/* Order Stats */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-primary-900 mb-4">
          Thống kê đơn hàng
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {stats.orderStats.pending_payment || 0}
            </p>
            <p className="text-sm text-primary-600 mt-1">Chờ thanh toán</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {stats.orderStats.processing || 0}
            </p>
            <p className="text-sm text-primary-600 mt-1">Đang xử lý</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {stats.orderStats.shipped || 0}
            </p>
            <p className="text-sm text-primary-600 mt-1">Đang giao</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {stats.orderStats.completed || 0}
            </p>
            <p className="text-sm text-primary-600 mt-1">Hoàn thành</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {stats.orderStats.cancelled || 0}
            </p>
            <p className="text-sm text-primary-600 mt-1">Đã hủy</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-primary-900 mb-4">
        Quản lý nhanh
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/users" className="card p-6 hover:shadow-lg transition-shadow">
          <FiUsers className="text-primary-700 mb-3" size={32} />
          <h3 className="text-xl font-semibold text-primary-900 mb-2">Quản lý người dùng</h3>
          <p className="text-primary-600">Xem và quản lý tất cả người dùng</p>
        </Link>

        <Link to="/admin/shops" className="card p-6 hover:shadow-lg transition-shadow">
          <MdStorefront className="text-primary-700 mb-3" size={32} />
          <h3 className="text-xl font-semibold text-primary-900 mb-2">Quản lý cửa hàng</h3>
          <p className="text-primary-600">Duyệt và quản lý cửa hàng</p>
          {stats.pendingShops > 0 && (
            <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              {stats.pendingShops} chờ duyệt
            </span>
          )}
        </Link>

        <Link to="/admin/products" className="card p-6 hover:shadow-lg transition-shadow">
          <FiPackage className="text-primary-700 mb-3" size={32} />
          <h3 className="text-xl font-semibold text-primary-900 mb-2">Quản lý sản phẩm</h3>
          <p className="text-primary-600">Xem và kiểm duyệt sản phẩm</p>
        </Link>

        <Link to="/admin/orders" className="card p-6 hover:shadow-lg transition-shadow">
          <FiShoppingBag className="text-primary-700 mb-3" size={32} />
          <h3 className="text-xl font-semibold text-primary-900 mb-2">Quản lý đơn hàng</h3>
          <p className="text-primary-600">Xem tất cả đơn hàng</p>
        </Link>

        <Link to="/admin/categories" className="card p-6 hover:shadow-lg transition-shadow">
          <FiTrendingUp className="text-primary-700 mb-3" size={32} />
          <h3 className="text-xl font-semibold text-primary-900 mb-2">Quản lý danh mục</h3>
          <p className="text-primary-600">Thêm và sửa danh mục</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
