import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';

const CommissionChart = () => {
  const { data: revenueData } = useQuery({
    queryKey: ['admin-monthly-revenue'],
    queryFn: adminService.getMonthlyRevenue,
  });

  const monthlyData = revenueData?.data || [];
  const COMMISSION_RATE = 0.05; // 5%

  const getMonthName = (monthIndex) => {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return months[monthIndex];
  };

  const maxCommission = Math.max(...monthlyData.map(d => d.commission || 0), 1);
  const chartHeight = 300;

  const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalCommission = monthlyData.reduce((sum, d) => sum + d.commission, 0);

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-primary-900 mb-6">
        💵 Hoa hồng Admin theo tháng ({(COMMISSION_RATE * 100).toFixed(0)}% doanh thu)
      </h2>

      {monthlyData.length === 0 ? (
        <div className="text-center py-12 text-primary-600">
          <p>Chưa có dữ liệu hoa hồng</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Commission Bar Chart */}
          <div className="overflow-x-auto">
            <div className="flex items-end justify-between gap-2 min-w-full" style={{ height: `${chartHeight}px` }}>
              {monthlyData.map((data, index) => {
                const commission = data.commission || 0;
                const barHeight = (commission / maxCommission) * chartHeight;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full flex justify-center">
                      <div
                        className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t hover:from-orange-600 hover:to-orange-500 transition-all duration-200 cursor-pointer relative group"
                        style={{ height: `${barHeight}px` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-primary-900 text-white px-3 py-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div className="font-semibold">{formatCurrency(commission)}</div>
                          <div className="text-xs text-orange-200">Doanh thu: {formatCurrency(data.revenue)}</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-primary-600 mt-2 text-center font-medium">
                      {getMonthName(index)}
                    </p>
                    <p className="text-xs text-primary-500 mt-1">
                      {formatCurrency(commission)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-primary-200">
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-primary-600 mb-1">Tổng hoa hồng</p>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(totalCommission)}
              </p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-primary-600 mb-1">Trung bình/tháng</p>
              <p className="text-3xl font-bold text-amber-600">
                {formatCurrency(totalCommission / (monthlyData.length || 1))}
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-primary-600 mb-1">Tổng doanh thu</p>
              <p className="text-3xl font-bold text-yellow-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>

          {/* Commission Rate Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">ℹ️ Tỷ lệ hoa hồng:</span> {(COMMISSION_RATE * 100).toFixed(0)}% từ doanh thu (subtotal) của các đơn hàng đã giao
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionChart;
