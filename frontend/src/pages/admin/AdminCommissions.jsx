import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import { FiDollarSign, FiCheck, FiClock } from 'react-icons/fi';

const AdminCommissions = () => {
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: shopsData, isLoading } = useQuery({
    queryKey: ['admin-shops-commission'],
    queryFn: () => adminService.getAllShops({ status: 'active' }),
  });

  if (isLoading) return <Loading />;

  const shops = shopsData?.data || [];

  // Filter shops based on commission status
  const filteredShops = statusFilter === 'all'
    ? shops
    : shops.filter(shop => shop.commissionStatus === statusFilter);

  const statusCounts = {
    all: shops.length,
    unpaid: shops.filter(s => s.commissionStatus === 'unpaid').length,
    partial: shops.filter(s => s.commissionStatus === 'partial').length,
    paid: shops.filter(s => s.commissionStatus === 'paid').length,
  };

  const totalCommission = shops.reduce((sum, shop) => sum + (shop.totalCommission || 0), 0);
  const totalPaid = shops.reduce((sum, shop) => sum + (shop.paidCommission || 0), 0);
  const totalUnpaid = totalCommission - totalPaid;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="badge badge-success">✅ Đã trả</span>;
      case 'partial':
        return <span className="badge badge-warning">⏳ Trả một phần</span>;
      case 'unpaid':
        return <span className="badge badge-danger">❌ Chưa trả</span>;
      default:
        return <span className="badge badge-secondary">Không xác định</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Quản lý hoa hồng cửa hàng
      </h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-200 rounded-lg">
              <FiDollarSign className="text-orange-700" size={24} />
            </div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-200 px-2 py-1 rounded">
              💰 Tổng
            </span>
          </div>
          <p className="text-3xl font-bold text-orange-900 mb-1">
            {formatCurrency(totalCommission)}
          </p>
          <p className="text-sm text-orange-700">Tổng hoa hồng phải trả</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-200 rounded-lg">
              <FiCheck className="text-green-700" size={24} />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-200 px-2 py-1 rounded">
              ✅ Đã trả
            </span>
          </div>
          <p className="text-3xl font-bold text-green-900 mb-1">
            {formatCurrency(totalPaid)}
          </p>
          <p className="text-sm text-green-700">Hoa hồng đã thanh toán</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-200 rounded-lg">
              <FiClock className="text-red-700" size={24} />
            </div>
            <span className="text-xs font-semibold text-red-600 bg-red-200 px-2 py-1 rounded">
              ⏳ Chưa trả
            </span>
          </div>
          <p className="text-3xl font-bold text-red-900 mb-1">
            {formatCurrency(totalUnpaid)}
          </p>
          <p className="text-sm text-red-700">Hoa hồng chưa thanh toán</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'unpaid', label: 'Chưa trả' },
            { key: 'partial', label: 'Trả một phần' },
            { key: 'paid', label: 'Đã trả' },
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

      {/* Shops Table */}
      {filteredShops.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-primary-600 text-lg">Không có cửa hàng nào</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">Tên cửa hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">Chủ cửa hàng</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-primary-700 uppercase">Tổng hoa hồng</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-primary-700 uppercase">Đã trả</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-primary-700 uppercase">Còn lại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">Lần trả cuối</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-primary-200">
                {filteredShops.map((shop) => {
                  const remaining = (shop.totalCommission || 0) - (shop.paidCommission || 0);
                  return (
                    <tr key={shop._id} className="hover:bg-primary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-900">{shop.shopName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-600">{shop.user?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-orange-600">
                          {formatCurrency(shop.totalCommission || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(shop.paidCommission || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-semibold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(remaining)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(shop.commissionStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-600">
                          {shop.commissionPaidAt
                            ? new Date(shop.commissionPaidAt).toLocaleDateString('vi-VN')
                            : 'Chưa trả'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommissions;
