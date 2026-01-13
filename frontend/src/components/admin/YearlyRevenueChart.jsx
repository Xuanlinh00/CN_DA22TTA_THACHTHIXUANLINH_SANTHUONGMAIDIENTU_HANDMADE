import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';

const YearlyRevenueChart = () => {
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState(currentYear - 4);
  const [endYear, setEndYear] = useState(currentYear);

  const validStartYear = Math.min(startYear, endYear);
  const validEndYear = Math.max(startYear, endYear);

  const { data: yearlyData = [], isLoading } = useQuery({
    queryKey: ['admin-yearly-revenue', validStartYear, validEndYear],
    queryFn: async () => {
      const years = [];
      for (let year = validStartYear; year <= validEndYear; year++) {
        const response = await adminService.getMonthlyRevenue(year);
        const yearRevenue = response.data.reduce((sum, m) => sum + (m.revenue || 0), 0);
        const yearOrders = response.data.reduce((sum, m) => sum + (m.orders || 0), 0);
        years.push({ year, revenue: yearRevenue, orders: yearOrders });
      }
      return years.sort((a, b) => a.year - b.year); // Đảm bảo thứ tự tăng dần
    },
  });

  const dataWithValues = yearlyData.filter(d => d.orders > 0 || d.revenue > 0);
  const maxOrders = Math.max(...dataWithValues.map(d => d.orders), 1);

  const totalRevenue = dataWithValues.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = dataWithValues.reduce((s, d) => s + d.orders, 0);
  const avgRevenue = totalRevenue / (dataWithValues.length || 1);

  const mid = Math.floor(dataWithValues.length / 2);
  const firstHalfAvg = dataWithValues.slice(0, mid).reduce((s, d) => s + d.revenue, 0) / (mid || 1);
  const secondHalfAvg = dataWithValues.slice(mid).reduce((s, d) => s + d.revenue, 0) / (dataWithValues.length - mid || 1);
  const growthTrend = ((secondHalfAvg - firstHalfAvg) / (firstHalfAvg || 1)) * 100;

  const yearOptions = Array.from({ length: 15 }, (_, i) => currentYear - 10 + i);

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="card p-6 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-primary-900">📈 Doanh thu theo năm</h2>
          <p className="text-sm text-primary-600 mt-1">Từ {validStartYear} đến {validEndYear}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={startYear}
            onChange={(e) => setStartYear(+e.target.value)}
            className="px-4 py-2 border border-primary-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="text-primary-700 font-bold">→</span>
          <select
            value={endYear}
            onChange={(e) => setEndYear(+e.target.value)}
            className="px-4 py-2 border border-primary-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {dataWithValues.length === 0 ? (
        <div className="text-center py-16 text-primary-600">
          <p className="text-lg">Chưa có dữ liệu doanh thu trong khoảng thời gian này</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <p className="text-sm font-semibold text-blue-700">💰 Tổng doanh thu</p>
              <p className="text-3xl font-bold text-blue-800 mt-2">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-blue-600 mt-2">Trong {dataWithValues.length} năm</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <p className="text-sm font-semibold text-green-700">📊 Trung bình/năm</p>
              <p className="text-3xl font-bold text-green-800 mt-2">{formatCurrency(avgRevenue)}</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <p className="text-sm font-semibold text-purple-700">📦 Tổng đơn hàng</p>
              <p className="text-3xl font-bold text-purple-800 mt-2">{totalOrders.toLocaleString()}</p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-primary-100">
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-t from-pink-500 to-pink-400 rounded"></div>
                <span className="text-sm font-medium text-primary-700">Số đơn hàng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded"></div>
                <span className="text-sm font-medium text-primary-700">Doanh thu (dưới thanh)</span>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-end justify-center gap-6 md:gap-10" style={{ height: '300px', position: 'relative' }}>
                {/* Y-axis Grid Lines */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs font-semibold text-primary-600 pr-3 border-r-2 border-primary-300">
                  <span className="text-right">{maxOrders}</span>
                  <span className="text-right">{Math.floor(maxOrders * 0.75)}</span>
                  <span className="text-right">{Math.floor(maxOrders * 0.5)}</span>
                  <span className="text-right">{Math.floor(maxOrders * 0.25)}</span>
                  <span className="text-right">0</span>
                </div>

                {/* Grid Background */}
                <div className="absolute left-12 right-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-dashed border-primary-200"></div>
                  <div className="border-t border-dashed border-primary-200"></div>
                  <div className="border-t border-dashed border-primary-200"></div>
                  <div className="border-t border-dashed border-primary-200"></div>
                  <div className="border-t-2 border-primary-300"></div>
                </div>

                {/* Bars */}
                <div className="flex items-end justify-center gap-6 md:gap-10 w-full pl-12 relative z-10">
                  {dataWithValues.map((item) => {
                    const height = (item.orders / maxOrders) * 100;
                    return (
                      <div key={item.year} className="flex flex-col items-center flex-1 max-w-32 group">
                        <div className="relative w-full" style={{ height: '240px' }}>
                          <div
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-lg shadow-lg hover:from-pink-600 hover:to-pink-500 transition-all duration-300"
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-primary-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                              {item.orders.toLocaleString()} đơn hàng
                            </div>
                          </div>
                        </div>
                        <p className="mt-4 text-lg font-bold text-primary-900">{item.year}</p>
                        <p className="text-sm font-semibold text-blue-600 mt-1">{formatCurrency(item.revenue)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Trend */}
          <div className="mt-6 p-5 bg-primary-50 rounded-xl border border-primary-200">
            <p className="text-sm text-primary-800">
              <span className="font-bold">Xu hướng tăng trưởng:</span>{' '}
              {growthTrend > 5 ? (
                <span className="text-green-600 font-bold text-lg">↑ Tăng mạnh {growthTrend.toFixed(1)}%</span>
              ) : growthTrend > 0 ? (
                <span className="text-green-600 font-bold">↑ Tăng {growthTrend.toFixed(1)}%</span>
              ) : growthTrend > -5 ? (
                <span className="text-yellow-600 font-bold">→ Ổn định</span>
              ) : (
                <span className="text-red-600 font-bold">↓ Giảm {Math.abs(growthTrend).toFixed(1)}%</span>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default YearlyRevenueChart;
