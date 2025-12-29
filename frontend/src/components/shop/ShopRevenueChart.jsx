import { useQuery } from '@tanstack/react-query';
import { shopService } from '../../services/shopService';
import { formatCurrency } from '../../utils/formatters';
import Loading from '../common/Loading';

const ShopRevenueChart = () => {
  const { data: revenueData, isLoading, error } = useQuery({
    queryKey: ['shop-monthly-revenue'],
    queryFn: shopService.getMonthlyRevenue,
  });

  const monthlyData = revenueData?.data || [];

  const getMonthName = (monthIndex) => {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return months[monthIndex];
  };

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue || 0), 1);
  const chartHeight = 250;

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-primary-900 mb-6">
          📊 Doanh thu theo tháng
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-primary-900 mb-6">
          📊 Doanh thu theo tháng
        </h2>
        <div className="text-center py-12 text-red-600">
          <p>Lỗi tải dữ liệu: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-primary-900 mb-6">
        📊 Doanh thu theo tháng
      </h2>

      {monthlyData.length === 0 || !monthlyData.some(d => d.revenue > 0) ? (
        <div className="text-center py-12 text-primary-600">
          <p>Chưa có dữ liệu doanh thu. Hãy hoàn thành một số đơn hàng để xem biểu đồ.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Simple Bar Chart */}
          <div className="overflow-x-auto">
            <div className="flex items-end justify-between gap-2 min-w-full" style={{ height: `${chartHeight}px` }}>
              {monthlyData.map((data, index) => {
                const barHeight = (data.revenue / maxRevenue) * chartHeight;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full flex justify-center">
                      <div
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t hover:from-green-600 hover:to-green-500 transition-all duration-200 cursor-pointer relative group"
                        style={{ height: `${barHeight}px` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-primary-900 text-white px-3 py-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          {formatCurrency(data.revenue)}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-primary-600 mt-2 text-center font-medium">
                      {getMonthName(index)}
                    </p>
                    <p className="text-xs text-primary-500 mt-1">
                      {data.orders} đơn
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-primary-200">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-primary-600 mb-1">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(monthlyData.reduce((sum, d) => sum + d.revenue, 0))}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-primary-600 mb-1">Trung bình/tháng</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlyData.reduce((sum, d) => sum + d.revenue, 0) / (monthlyData.length || 1))}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-primary-600 mb-1">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-purple-600">
                {monthlyData.reduce((sum, d) => sum + d.orders, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopRevenueChart;
