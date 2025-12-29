import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';
import FloatingChat from '../../components/common/FloatingChat';
import RevenueChart from '../../components/admin/RevenueChart';
import CommissionChart from '../../components/admin/CommissionChart';
import TopSellingProducts from '../../components/admin/TopSellingProducts';
import toast from 'react-hot-toast';

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
    queryFn: () => adminService.getAllShops({ status: 'active' }),
  });

  const { data: pendingShopsData, refetch: refetchPendingShops } = useQuery({
    queryKey: ['admin-pending-shops'],
    queryFn: adminService.getPendingShops,
  });

  const handleRefresh = async () => {
    try {
      await refetchPendingShops();
      toast.success('Đã cập nhật dữ liệu');
    } catch (error) {
      toast.error('Lỗi khi cập nhật dữ liệu');
    }
  };

  const stats = {
    totalUsers: usersData?.data?.length || 0,
    totalShops: shopsData?.data?.length || 0,
    pendingShops: pendingShopsData?.data?.length || 0,
    totalRevenue: revenueData?.data?.totalRevenue || 0,
    totalOrders: revenueData?.data?.totalOrders || 0,
    totalCommission: revenueData?.data?.totalCommission || 0,
    commissionRate: revenueData?.data?.commissionRate || 0.05,
    orderStats: {
      pending_payment: orderStatsData?.data?.pending_payment || 0,
      processing: orderStatsData?.data?.processing || 0,
      shipped: orderStatsData?.data?.shipped || 0,
      completed: orderStatsData?.data?.completed || 0,
      cancelled: orderStatsData?.data?.cancelled || 0,
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-sans font-bold text-primary-900">
          Admin Dashboard
        </h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors"
        >
          <FiRefreshCw size={18} />
          <span>Cập nhật</span>
        </button>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-primary-900 mb-4">
        Quản lý nhanh
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <Link to="/admin/commissions" className="card p-6 hover:shadow-lg transition-shadow">
          <FiDollarSign className="text-primary-700 mb-3" size={32} />
          <h3 className="text-xl font-semibold text-primary-900 mb-2">Quản lý hoa hồng</h3>
          <p className="text-primary-600">Theo dõi thanh toán hoa hồng</p>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-200 rounded-lg">
              <FiUsers className="text-blue-700" size={24} />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-200 px-2 py-1 rounded">
              👥 Người dùng
            </span>
          </div>
          <p className="text-4xl font-bold text-blue-900 mb-1">{stats.totalUsers}</p>
          <p className="text-sm text-blue-700">Tổng người dùng</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-200 rounded-lg">
              <MdStorefront className="text-green-700" size={24} />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-200 px-2 py-1 rounded">
              🏪 Cửa hàng
            </span>
          </div>
          <p className="text-4xl font-bold text-green-900 mb-1">{stats.totalShops}</p>
          <p className="text-sm text-green-700">Tổng cửa hàng</p>
          {stats.pendingShops > 0 && (
            <p className="text-xs text-yellow-700 mt-2 font-semibold">
              ⏳ {stats.pendingShops} chờ duyệt
            </p>
          )}
        </div>

        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-200 rounded-lg">
              <FiShoppingBag className="text-purple-700" size={24} />
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-200 px-2 py-1 rounded">
              📦 Đơn hàng
            </span>
          </div>
          <p className="text-4xl font-bold text-purple-900 mb-1">{stats.totalOrders}</p>
          <p className="text-sm text-purple-700">Tổng đơn hàng hoàn thành</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-accent-50 to-accent-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent-200 rounded-lg">
              <FiDollarSign className="text-accent-700" size={24} />
            </div>
            <span className="text-xs font-semibold text-accent-600 bg-accent-200 px-2 py-1 rounded">
              💰 Doanh thu
            </span>
          </div>
          <p className="text-3xl font-bold text-accent-900 mb-1">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <p className="text-sm text-accent-700">Tổng doanh thu</p>
        </div>
      </div>

      {/* Commission Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
            💵 Hoa hồng Admin ({(stats.commissionRate * 100).toFixed(0)}%)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-700">Tổng doanh thu:</span>
              <span className="text-lg font-semibold text-orange-900">
                {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
            <div className="border-t border-orange-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-orange-700">Hoa hồng ({(stats.commissionRate * 100).toFixed(0)}%):</span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.totalCommission)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
            📈 Tóm tắt doanh thu
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-sm text-indigo-700">Đơn hàng hoàn thành:</span>
              <span className="font-semibold text-indigo-900">{stats.totalOrders}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-sm text-indigo-700">Trung bình/đơn:</span>
              <span className="font-semibold text-indigo-900">
                {stats.totalOrders > 0 
                  ? formatCurrency(stats.totalRevenue / stats.totalOrders)
                  : '0 ₫'
                }
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-sm text-indigo-700">Cửa hàng hoạt động:</span>
              <span className="font-semibold text-indigo-900">{stats.totalShops}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Stats */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-primary-900 mb-6">
          📊 Thống kê trạng thái đơn hàng
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
            <p className="text-3xl font-bold text-yellow-600">
              {stats.orderStats.pending_payment}
            </p>
            <p className="text-sm text-yellow-700 mt-2 font-semibold">⏳ Chờ thanh toán</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <p className="text-3xl font-bold text-blue-600">
              {stats.orderStats.processing}
            </p>
            <p className="text-sm text-blue-700 mt-2 font-semibold">⚙️ Đang xử lý</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <p className="text-3xl font-bold text-purple-600">
              {stats.orderStats.shipped}
            </p>
            <p className="text-sm text-purple-700 mt-2 font-semibold">🚚 Đang giao</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <p className="text-3xl font-bold text-green-600">
              {stats.orderStats.completed}
            </p>
            <p className="text-sm text-green-700 mt-2 font-semibold">✅ Hoàn thành</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
            <p className="text-3xl font-bold text-red-600">
              {stats.orderStats.cancelled}
            </p>
            <p className="text-sm text-red-700 mt-2 font-semibold">❌ Đã hủy</p>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <RevenueChart />

      {/* Top Selling Products */}
      <TopSellingProducts />

      {/* Commission Chart */}
      <CommissionChart />

      <FloatingChat />
    </div>
  );
};

export default AdminDashboard;
