import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';

const RevenueChart = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const { data: revenueData } = useQuery({
    queryKey: ['admin-monthly-revenue', selectedYear],
    queryFn: () => adminService.getMonthlyRevenue(selectedYear),
  });

  const monthlyData = revenueData?.data || [];

  // Tính toán dữ liệu cho biểu đồ
  const getMonthName = (monthIndex) => {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return months[monthIndex];
  };

  // Tạo danh sách năm (năm hiện tại - 5 năm đến năm hiện tại + 2 năm tương lai)
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue || 0), 1);
  const chartHeight = 300;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-primary-900">
          📊 Doanh thu theo tháng
        </h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 border border-primary-300 rounded-lg bg-white text-primary-900 font-medium hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {monthlyData.length === 0 ? (
        <div className="text-center py-12 text-primary-600">
          <p>Chưa có dữ liệu doanh thu</p>
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
                        className="w-full bg-gradient-to-t from-accent-500 to-accent-400 rounded-t hover:from-accent-600 hover:to-accent-500 transition-all duration-200 cursor-pointer relative group"
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

export default RevenueChart;
